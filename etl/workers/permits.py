"""
PP&D Permit Data Worker

Source: City of Portland GIS Open Data Portal — ArcGIS REST API
URL: https://gis-pdx.opendata.arcgis.com/
Tier: A (Fully Automated)
Schedule: Weekly

Queries the ArcGIS Feature Service for building permits. Paginates through
all records (API max ~2000 per request), computes processing-time metrics,
and loads into the database.
"""

from __future__ import annotations

from typing import Any

import pandas as pd
import requests

from base_worker import BaseWorker, EtlError

# TODO: Replace with the actual dataset feature service URL.
# Find it by searching "permits" on https://gis-pdx.opendata.arcgis.com/
# and clicking "API Explorer" on the dataset page.
_FEATURE_SERVICE_URL = (
    "https://gis-pdx.opendata.arcgis.com/datasets/"
    "DATASET_ID_HERE/FeatureServer/0/query"
)

_PAGE_SIZE = 2000  # ArcGIS max record count per request


class PermitsWorker(BaseWorker):
    name = "permits"
    staging_table = "staging.permits"
    production_table = "public.permits"
    schedule = "weekly"

    def fetch(self) -> list[dict[str, Any]]:
        """Paginate through the ArcGIS REST API and collect all records."""
        all_features: list[dict[str, Any]] = []
        offset = 0

        while True:
            params = {
                "where": "1=1",
                "outFields": "*",
                "resultOffset": offset,
                "resultRecordCount": _PAGE_SIZE,
                "f": "json",
                "orderByFields": "OBJECTID ASC",
            }
            resp = requests.get(_FEATURE_SERVICE_URL, params=params, timeout=60)
            resp.raise_for_status()
            data = resp.json()

            if "error" in data:
                raise EtlError(f"ArcGIS API error: {data['error']}")

            features = data.get("features", [])
            if not features:
                break

            all_features.extend(features)
            offset += len(features)

            # ArcGIS signals end-of-data when exceededTransferLimit is False
            if not data.get("exceededTransferLimit", False):
                break

        if not all_features:
            raise EtlError("ArcGIS returned zero permit features")

        return all_features

    def validate(self, raw: list[dict[str, Any]]) -> None:
        """Check for expected attribute fields."""
        if not raw:
            raise EtlError("Empty feature list")

        sample_attrs = raw[0].get("attributes", {})
        # TODO: Confirm exact field names from the live feature service
        expected = {"PERMIT_NUM", "PERMIT_TYPE", "STATUS"}
        actual = set(sample_attrs.keys())
        missing = expected - actual
        if missing:
            raise EtlError(
                f"Permit features missing expected fields: {missing}. "
                f"Sample fields: {sorted(actual)[:20]}"
            )

    def transform(self, raw: list[dict[str, Any]]) -> pd.DataFrame:
        """Flatten ArcGIS features into a clean DataFrame."""
        rows = [f["attributes"] for f in raw]
        df = pd.DataFrame(rows)

        # Normalize column names
        df.columns = [c.strip().lower() for c in df.columns]

        # TODO: Adjust column names to match actual feature service schema
        date_cols = [c for c in df.columns if "date" in c]
        for col in date_cols:
            # ArcGIS returns dates as epoch milliseconds
            df[col] = pd.to_datetime(df[col], unit="ms", errors="coerce")

        # Compute permit processing time (calendar days)
        if "issued_date" in df.columns and "application_date" in df.columns:
            df["processing_days"] = (
                df["issued_date"] - df["application_date"]
            ).dt.days

        # Derive month for aggregation
        if "application_date" in df.columns:
            df["application_month"] = (
                df["application_date"].dt.to_period("M").astype(str)
            )

        return df

    def quality_check(self, df: pd.DataFrame) -> None:
        super().quality_check(df)

        if "processing_days" in df.columns:
            # Flag if >20% of issued permits have negative processing time
            issued = df[df.get("processing_days", pd.Series()).notna()]
            if not issued.empty:
                bad = (issued["processing_days"] < 0).sum()
                if bad / len(issued) > 0.20:
                    raise EtlError(
                        f"{bad}/{len(issued)} permits have negative processing time"
                    )
