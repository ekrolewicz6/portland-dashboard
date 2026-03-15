"""
PPB Crime Data Worker

Sources:
  1. Portland Maps ArcGIS REST API — Crime MapServer grid layers
     URL: https://www.portlandmaps.com/arcgis/rest/services/Public/Crime/MapServer
     Layers: 2 (Property), 41 (Person), 60 (Society)
  2. PPB Open Data Portal — CSV download (fallback / historical backfill)
     URL: https://www.portland.gov/police/open-data/reported-crime-data

Tier: B (Semi-Automated — ArcGIS grids are automated; CSV is manual fallback)
Schedule: Monthly

The ArcGIS Crime MapServer provides grid-aggregated crime data. The CSV
from PPB's open data portal provides offense-level detail. This worker
supports both sources.
"""

from __future__ import annotations

import io
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import requests
import structlog

from base_worker import BaseWorker, EtlError
from lib.arcgis_client import ArcGISClient

logger = structlog.get_logger()

# ArcGIS Crime MapServer
_CRIME_MAPSERVER_URL = (
    "https://www.portlandmaps.com/arcgis/rest/services/Public/Crime/MapServer"
)

# Crime grid layer IDs
_PROPERTY_CRIME_LAYER = 2   # All Property Crimes Grid
_PERSON_CRIME_LAYER = 41    # All Person Crimes Grid
_SOCIETY_CRIME_LAYER = 60   # All Society Crime Grids

# PPB open data CSV fallback
_PPB_CSV_PAGE = "https://www.portland.gov/police/open-data/reported-crime-data"
_CSV_URL_TEMPLATE = (
    "https://public.tableau.com/views/PPBOpenDataCrimeStatistics/"
    "CrimeData.csv?:showVizHome=no"
)


class PpbCrimeWorker(BaseWorker):
    name = "ppb_crime"
    staging_table = "safety.ppb_offenses_staging"
    production_table = "safety.ppb_offenses"
    schedule = "monthly"

    def __init__(self, source: str = "arcgis") -> None:
        """Initialize with source preference.

        Args:
            source: "arcgis" to query Crime MapServer grid layers,
                    "csv" to download from PPB open data portal.
        """
        self.source = source
        self._client = ArcGISClient()

    def fetch(self) -> Any:
        """Fetch crime data from the configured source."""
        if self.source == "arcgis":
            return self._fetch_arcgis()
        return self._fetch_csv()

    def _fetch_arcgis(self) -> dict[str, list[dict[str, Any]]]:
        """Query all three Crime MapServer grid layers."""
        results: dict[str, list[dict[str, Any]]] = {}

        layers = {
            "property": _PROPERTY_CRIME_LAYER,
            "person": _PERSON_CRIME_LAYER,
            "society": _SOCIETY_CRIME_LAYER,
        }

        for crime_type, layer_id in layers.items():
            logger.info("ppb_crime.fetch_layer", layer=crime_type, layer_id=layer_id)
            features = self._client.query_map_server(
                url=_CRIME_MAPSERVER_URL,
                layer_id=layer_id,
                where="1=1",
                out_fields="*",
            )
            results[crime_type] = features
            logger.info(
                "ppb_crime.layer_fetched",
                layer=crime_type,
                count=len(features),
            )

        total = sum(len(v) for v in results.values())
        if total == 0:
            raise EtlError("ArcGIS Crime MapServer returned zero features across all layers")

        return results

    def _fetch_csv(self) -> str:
        """Download crime CSV from PPB open data portal."""
        headers = {
            "User-Agent": "PortlandCommonsDashboard/1.0 (civic data project)",
        }
        response = requests.get(_CSV_URL_TEMPLATE, headers=headers, timeout=120)
        response.raise_for_status()

        if len(response.content) < 500:
            raise EtlError(
                f"PPB crime CSV response too small ({len(response.content)} bytes), "
                "likely an error page"
            )

        return response.text

    def validate(self, raw: Any) -> None:
        """Validate the fetched data based on source type."""
        if self.source == "arcgis":
            self._validate_arcgis(raw)
        else:
            self._validate_csv(raw)

    def _validate_arcgis(self, raw: dict[str, list[dict[str, Any]]]) -> None:
        """Check that at least one layer returned data."""
        for crime_type, features in raw.items():
            if features:
                sample = features[0].get("attributes", {})
                logger.info(
                    "ppb_crime.validate_sample",
                    layer=crime_type,
                    fields=sorted(sample.keys())[:10],
                )

    def _validate_csv(self, raw: str) -> None:
        """Check that the CSV has expected columns."""
        df = pd.read_csv(io.StringIO(raw), nrows=5)
        expected_cols = {"Offense Type", "Neighborhood", "Report Date"}
        actual_cols = set(df.columns)
        missing = expected_cols - actual_cols
        if missing:
            raise EtlError(
                f"PPB crime CSV missing expected columns: {missing}. "
                f"Found: {sorted(actual_cols)}"
            )

    def transform(self, raw: Any) -> pd.DataFrame:
        """Transform data based on source type."""
        if self.source == "arcgis":
            return self._transform_arcgis(raw)
        return self._transform_csv(raw)

    def _transform_arcgis(self, raw: dict[str, list[dict[str, Any]]]) -> pd.DataFrame:
        """Flatten ArcGIS grid features into a single DataFrame."""
        frames = []
        for crime_type, features in raw.items():
            if not features:
                continue
            rows = ArcGISClient.extract_attributes(features)
            df = pd.DataFrame(rows)
            df["crime_category"] = crime_type
            frames.append(df)

        if not frames:
            raise EtlError("No crime data to transform")

        combined = pd.concat(frames, ignore_index=True)

        # Normalize column names
        combined.columns = [
            c.strip().lower().replace(" ", "_")
            for c in combined.columns
        ]

        # Parse ArcGIS epoch date columns
        date_cols = [c for c in combined.columns if "date" in c or "time" in c]
        for col in date_cols:
            if combined[col].dtype in ("int64", "float64"):
                combined[col] = combined[col].apply(ArcGISClient.parse_epoch_ms)
                combined[col] = pd.to_datetime(combined[col], utc=True, errors="coerce")

        return combined

    def _transform_csv(self, raw: str) -> pd.DataFrame:
        """Parse PPB CSV into cleaned DataFrame."""
        df = pd.read_csv(io.StringIO(raw))

        # Normalize column names to snake_case
        df.columns = [
            c.strip().lower().replace(" ", "_").replace("-", "_")
            for c in df.columns
        ]

        rename_map = {
            "report_date": "report_date",
            "offense_type": "offense_type",
            "offense_category": "offense_category",
            "neighborhood": "neighborhood",
            "case_number": "case_number",
            "address": "block_address",
        }
        rename_map = {k: v for k, v in rename_map.items() if k in df.columns}
        df = df.rename(columns=rename_map)

        if "report_date" in df.columns:
            df["report_date"] = pd.to_datetime(df["report_date"], errors="coerce")

        if "report_date" in df.columns:
            df["report_month"] = df["report_date"].dt.to_period("M").astype(str)

        df = df.dropna(how="all")

        return df

    def quality_check(self, df: pd.DataFrame) -> None:
        """PPB-specific quality assertions."""
        super().quality_check(df)

        date_col = "report_date" if "report_date" in df.columns else None
        if date_col:
            null_dates = df[date_col].isna().sum()
            null_pct = null_dates / len(df)
            if null_pct > 0.05:
                raise EtlError(
                    f"PPB crime data has {null_pct:.0%} null dates in '{date_col}'"
                )
