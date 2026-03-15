"""
PBOT Service Requests Worker

Source: Portland Maps ArcGIS REST API — PBOT_Service_Requests MapServer
URL: https://www.portlandmaps.com/arcgis/rest/services/Public/PBOT_Service_Requests/MapServer/0
Tier: A (Fully Automated)
Schedule: Weekly

Queries PBOT service request records including request type, date,
location, status, and resolution date.
"""

from __future__ import annotations

from typing import Any

import pandas as pd
import structlog

from base_worker import BaseWorker, EtlError
from lib.arcgis_client import ArcGISClient

logger = structlog.get_logger()

_MAPSERVER_URL = (
    "https://www.portlandmaps.com/arcgis/rest/services"
    "/Public/PBOT_Service_Requests/MapServer"
)

_LAYER_ID = 0


class PbotRequestsWorker(BaseWorker):
    name = "pbot_requests"
    staging_table = "safety.pbot_requests_staging"
    production_table = "safety.pbot_requests"
    schedule = "weekly"

    def __init__(self) -> None:
        self._client = ArcGISClient()

    def fetch(self) -> list[dict[str, Any]]:
        """Query PBOT_Service_Requests MapServer layer 0."""
        features = self._client.query_map_server(
            url=_MAPSERVER_URL,
            layer_id=_LAYER_ID,
            where="1=1",
            out_fields="*",
        )

        if not features:
            raise EtlError("ArcGIS returned zero PBOT service request features")

        logger.info("pbot_requests.fetched", count=len(features))
        return features

    def validate(self, raw: list[dict[str, Any]]) -> None:
        """Check that the response contains feature attributes."""
        if not raw:
            raise EtlError("Empty PBOT service request feature list")

        sample_attrs = raw[0].get("attributes", {})
        if not sample_attrs:
            raise EtlError("PBOT features have no attributes")

        logger.info(
            "pbot_requests.validate_sample",
            fields=sorted(sample_attrs.keys())[:15],
        )

    def transform(self, raw: list[dict[str, Any]]) -> pd.DataFrame:
        """Flatten PBOT service request features into a clean DataFrame."""
        rows = ArcGISClient.extract_attributes(raw)
        df = pd.DataFrame(rows)

        # Normalize column names
        df.columns = [c.strip().lower() for c in df.columns]

        # Parse ArcGIS epoch-ms date columns
        date_cols = [c for c in df.columns if "date" in c or "time" in c]
        for col in date_cols:
            if col in df.columns and df[col].dtype in ("int64", "float64"):
                df[col] = df[col].apply(ArcGISClient.parse_epoch_ms)
                df[col] = pd.to_datetime(df[col], utc=True, errors="coerce")

        # Compute resolution time if we have request and resolution dates
        request_date = next(
            (c for c in df.columns if "request" in c and "date" in c),
            next((c for c in df.columns if "created" in c and "date" in c), None),
        )
        resolution_date = next(
            (c for c in df.columns if "resolution" in c and "date" in c),
            next((c for c in df.columns if "closed" in c and "date" in c), None),
        )
        if request_date and resolution_date:
            if request_date in df.columns and resolution_date in df.columns:
                df["resolution_days"] = (
                    df[resolution_date] - df[request_date]
                ).dt.days

        # Derive request month for aggregation
        if request_date and request_date in df.columns:
            df["request_month"] = (
                df[request_date].dt.to_period("M").astype(str)
            )

        # Drop fully-null rows
        df = df.dropna(how="all")

        return df

    def quality_check(self, df: pd.DataFrame) -> None:
        """PBOT-specific quality assertions."""
        super().quality_check(df)

        # Check for excessive resolution time outliers
        if "resolution_days" in df.columns:
            resolved = df[df["resolution_days"].notna()]
            if not resolved.empty:
                negative = (resolved["resolution_days"] < 0).sum()
                if negative / len(resolved) > 0.10:
                    raise EtlError(
                        f"{negative}/{len(resolved)} PBOT requests have "
                        "negative resolution time"
                    )
