"""
BDS Permit Data Worker

Source: Portland Maps ArcGIS REST API — BDS_Permit FeatureServer
URL: https://www.portlandmaps.com/arcgis/rest/services/Public/BDS_Permit/FeatureServer/22
Tier: A (Fully Automated)
Schedule: Weekly

Queries the BDS All Permits layer (layer 22, max 4000 records/query),
computes permit processing-time metrics, and loads into the database.
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
    "/Public/BDS_Permit/FeatureServer/22/query"
)

_OUT_FIELDS = (
    "PermitNum,PermitType,PermitTypeMapped,ProjectAddress,"
    "Valuation,ApplicationDate,IssuedDate,FinalDate,StatusCurrent"
)

_WHERE = "IssuedDate IS NOT NULL"


class PermitsWorker(BaseWorker):
    name = "permits"
    staging_table = "housing.permits_staging"
    production_table = "housing.permits"
    schedule = "weekly"

    def __init__(self) -> None:
        self._client = ArcGISClient()

    def fetch(self) -> list[dict[str, Any]]:
        """Paginate through BDS_Permit FeatureServer layer 22."""
        features = self._client.query_all(
            url=_FEATURE_URL,
            where=_WHERE,
            out_fields=_OUT_FIELDS,
        )

        if not features:
            raise EtlError("ArcGIS returned zero permit features")

        logger.info("permits.fetched", count=len(features))
        return features

    def validate(self, raw: list[dict[str, Any]]) -> None:
        """Check that the response contains expected BDS attribute fields."""
        if not raw:
            raise EtlError("Empty feature list")

        sample_attrs = raw[0].get("attributes", {})
        expected = {"PermitNum", "PermitType", "StatusCurrent"}
        actual = set(sample_attrs.keys())
        missing = expected - actual
        if missing:
            raise EtlError(
                f"Permit features missing expected fields: {missing}. "
                f"Sample fields: {sorted(actual)[:20]}"
            )

    def transform(self, raw: list[dict[str, Any]]) -> pd.DataFrame:
        """Flatten ArcGIS features and compute processing metrics."""
        rows = ArcGISClient.extract_attributes(raw)
        df = pd.DataFrame(rows)

        # Normalize column names to snake_case
        df.columns = [c.strip().lower() for c in df.columns]

        # Parse ArcGIS epoch-ms date columns
        date_cols = ["applicationdate", "issueddate", "finaldate"]
        for col in date_cols:
            if col in df.columns:
                df[col] = df[col].apply(ArcGISClient.parse_epoch_ms)
                df[col] = pd.to_datetime(df[col], utc=True, errors="coerce")

        # Compute permit processing time (calendar days)
        if "issueddate" in df.columns and "applicationdate" in df.columns:
            df["processing_days"] = (
                df["issueddate"] - df["applicationdate"]
            ).dt.days

        # Derive month key for aggregation
        if "applicationdate" in df.columns:
            df["application_month"] = (
                df["applicationdate"].dt.to_period("M").astype(str)
            )

        # Rename for clarity
        rename_map = {
            "permitnum": "permit_num",
            "permittype": "permit_type",
            "permittypemapped": "permit_type_mapped",
            "projectaddress": "project_address",
            "applicationdate": "application_date",
            "issueddate": "issued_date",
            "finaldate": "final_date",
            "statuscurrent": "status_current",
        }
        df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})

        return df

    def quality_check(self, df: pd.DataFrame) -> None:
        super().quality_check(df)

        if "processing_days" in df.columns:
            issued = df[df["processing_days"].notna()]
            if not issued.empty:
                bad = (issued["processing_days"] < 0).sum()
                if bad / len(issued) > 0.20:
                    raise EtlError(
                        f"{bad}/{len(issued)} permits have negative processing time"
                    )
