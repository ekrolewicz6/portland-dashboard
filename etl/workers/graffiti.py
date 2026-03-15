"""
BPS Graffiti Reports Worker

Source: Portland Maps ArcGIS REST API — BPS_Graffiti FeatureServer
URL: https://www.portlandmaps.com/arcgis/rest/services/Public/BPS_Graffiti/FeatureServer/0
Tier: A (Fully Automated)
Schedule: Weekly

Queries the BPS Graffiti feature layer for reported graffiti incidents,
including report date, location, status, and type.
"""

from __future__ import annotations

from typing import Any

import pandas as pd
import structlog

from base_worker import BaseWorker, EtlError
from lib.arcgis_client import ArcGISClient

logger = structlog.get_logger()

_FEATURE_URL = (
    "https://www.portlandmaps.com/arcgis/rest/services"
    "/Public/BPS_Graffiti/FeatureServer/0/query"
)


class GraffitiWorker(BaseWorker):
    name = "graffiti"
    staging_table = "safety.graffiti_reports_staging"
    production_table = "safety.graffiti_reports"
    schedule = "weekly"

    def __init__(self) -> None:
        self._client = ArcGISClient()

    def fetch(self) -> list[dict[str, Any]]:
        """Paginate through BPS_Graffiti FeatureServer layer 0."""
        features = self._client.query_all(
            url=_FEATURE_URL,
            where="1=1",
            out_fields="*",
        )

        if not features:
            raise EtlError("ArcGIS returned zero graffiti features")

        logger.info("graffiti.fetched", count=len(features))
        return features

    def validate(self, raw: list[dict[str, Any]]) -> None:
        """Check that the response contains feature attributes."""
        if not raw:
            raise EtlError("Empty graffiti feature list")

        sample_attrs = raw[0].get("attributes", {})
        if not sample_attrs:
            raise EtlError("Graffiti features have no attributes")

        logger.info(
            "graffiti.validate_sample",
            fields=sorted(sample_attrs.keys())[:15],
        )

    def transform(self, raw: list[dict[str, Any]]) -> pd.DataFrame:
        """Flatten graffiti features into a clean DataFrame."""
        rows = ArcGISClient.extract_attributes(raw)
        df = pd.DataFrame(rows)

        # Normalize column names
        df.columns = [c.strip().lower() for c in df.columns]

        # Parse ArcGIS epoch-ms date columns
        date_cols = [c for c in df.columns if "date" in c or "time" in c]
        for col in date_cols:
            if df[col].dtype in ("int64", "float64"):
                df[col] = df[col].apply(ArcGISClient.parse_epoch_ms)
                df[col] = pd.to_datetime(df[col], utc=True, errors="coerce")

        # Derive report month for aggregation
        report_date_col = next(
            (c for c in df.columns if "report" in c and "date" in c),
            next((c for c in date_cols if c in df.columns), None),
        )
        if report_date_col and report_date_col in df.columns:
            df["report_month"] = (
                df[report_date_col].dt.to_period("M").astype(str)
            )

        # Drop fully-null rows
        df = df.dropna(how="all")

        return df

    def quality_check(self, df: pd.DataFrame) -> None:
        """Graffiti-specific quality assertions."""
        super().quality_check(df)

        # Verify we have at least some date data
        date_cols = [c for c in df.columns if "date" in c]
        if date_cols:
            primary_date = date_cols[0]
            null_pct = df[primary_date].isna().sum() / len(df)
            if null_pct > 0.30:
                raise EtlError(
                    f"Graffiti data has {null_pct:.0%} null values in '{primary_date}'"
                )
