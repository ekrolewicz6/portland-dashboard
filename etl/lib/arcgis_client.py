"""
Shared ArcGIS REST API client for Portland Commons Dashboard ETL.

Handles FeatureServer and MapServer queries with automatic pagination,
epoch timestamp parsing, and structured error handling.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import requests
import structlog

logger = structlog.get_logger()

# Portland Maps ArcGIS REST base URL
PORTLANDMAPS_BASE = "https://www.portlandmaps.com/arcgis/rest/services"

# Default page size — BDS_Permit advertises max 4000; use that as default.
DEFAULT_PAGE_SIZE = 4000

# Request timeout in seconds
DEFAULT_TIMEOUT = 60


class ArcGISError(Exception):
    """Raised when the ArcGIS REST API returns an error response."""


class ArcGISClient:
    """Client for querying Portland Maps ArcGIS REST services.

    Supports both FeatureServer and MapServer layer queries with
    automatic pagination and ArcGIS epoch timestamp conversion.
    """

    def __init__(self, timeout: int = DEFAULT_TIMEOUT):
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "PortlandCommonsDashboard/1.0 (civic data project)",
        })

    # ------------------------------------------------------------------ #
    # Public query methods
    # ------------------------------------------------------------------ #

    def query_feature_layer(
        self,
        url: str,
        where: str = "1=1",
        out_fields: str = "*",
        result_offset: int = 0,
        result_record_count: int = DEFAULT_PAGE_SIZE,
    ) -> tuple[list[dict[str, Any]], bool]:
        """Execute a single paginated query against a FeatureServer layer.

        Returns a tuple of (features list, exceededTransferLimit flag).
        """
        params = {
            "where": where,
            "outFields": out_fields,
            "resultOffset": result_offset,
            "resultRecordCount": result_record_count,
            "f": "json",
            "orderByFields": "OBJECTID ASC",
        }

        logger.debug(
            "arcgis.query",
            url=url,
            offset=result_offset,
            count=result_record_count,
        )

        resp = self.session.get(url, params=params, timeout=self.timeout)
        resp.raise_for_status()
        data = resp.json()

        if "error" in data:
            raise ArcGISError(
                f"ArcGIS error ({data['error'].get('code', '?')}): "
                f"{data['error'].get('message', data['error'])}"
            )

        features = data.get("features", [])
        return features, data.get("exceededTransferLimit", False)

    def query_all(
        self,
        url: str,
        where: str = "1=1",
        out_fields: str = "*",
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> list[dict[str, Any]]:
        """Query a FeatureServer layer with automatic pagination.

        Returns all matching feature dicts (with attributes and optional geometry).
        """
        all_features: list[dict[str, Any]] = []
        offset = 0

        while True:
            features, exceeded = self.query_feature_layer(
                url=url,
                where=where,
                out_fields=out_fields,
                result_offset=offset,
                result_record_count=page_size,
            )

            if not features:
                break

            all_features.extend(features)
            offset += len(features)

            logger.info(
                "arcgis.paginate",
                url=url,
                fetched=len(all_features),
            )

            if not exceeded:
                break

        return all_features

    def query_map_server(
        self,
        url: str,
        layer_id: int,
        where: str = "1=1",
        out_fields: str = "*",
        page_size: int = DEFAULT_PAGE_SIZE,
    ) -> list[dict[str, Any]]:
        """Query a MapServer layer with automatic pagination.

        MapServer query endpoints use the same parameter format as
        FeatureServer but live under /MapServer/{layerId}/query.
        """
        layer_url = f"{url}/{layer_id}/query"
        return self.query_all(
            url=layer_url,
            where=where,
            out_fields=out_fields,
            page_size=page_size,
        )

    # ------------------------------------------------------------------ #
    # Timestamp helpers
    # ------------------------------------------------------------------ #

    @staticmethod
    def parse_epoch_ms(value: Any) -> datetime | None:
        """Convert ArcGIS epoch milliseconds to a timezone-aware datetime.

        ArcGIS stores dates as milliseconds since 1970-01-01 UTC.
        Returns None for null/invalid values.
        """
        if value is None:
            return None
        try:
            ts = int(value)
            return datetime.fromtimestamp(ts / 1000.0, tz=timezone.utc)
        except (ValueError, TypeError, OSError):
            return None

    @staticmethod
    def extract_attributes(features: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Extract the 'attributes' dict from each feature."""
        return [f["attributes"] for f in features if "attributes" in f]
