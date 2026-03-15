"""
Placer.ai Foot Traffic Worker

Source: Placer.ai — mobile-derived foot traffic analytics
URL: https://www.placer.ai/solutions/civic
Tier: D (Partnership)
Schedule: Weekly

This worker is a stub. Placer.ai data access requires either:
  A) Data sharing agreement with Downtown Portland Clean & Safe (preferred)
  B) Direct Placer.ai civic subscription ($2-5k/month)

Until an access method is established, this worker can ingest data from
a CSV/JSON file dropped into the data/placer/ directory (watched-folder
pattern), or from the Placer.ai API if credentials are provided.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd
import requests

from base_worker import BaseWorker, EtlError
from config.settings import settings

_DATA_DIR = settings.etl.data_dir / "placer"


class PlacerTrafficWorker(BaseWorker):
    name = "placer_traffic"
    staging_table = "staging.placer_traffic"
    production_table = "public.placer_traffic"
    schedule = "weekly"

    def fetch(self) -> pd.DataFrame | dict[str, Any]:
        """Attempt to load Placer.ai data from API or local file.

        Priority:
        1. Placer.ai API (if credentials are configured)
        2. Latest CSV/JSON in data/placer/ directory (manual drop)
        """
        # Option 1: API-based fetch
        if settings.api_keys.placer:
            return self._fetch_from_api()

        # Option 2: File-based fetch (watched folder)
        return self._fetch_from_file()

    def _fetch_from_api(self) -> dict[str, Any]:
        """Pull foot traffic data from Placer.ai API.

        TODO: Implement once API access is established. The Placer.ai API
        documentation is available only to subscribers. Expected endpoints:
        - GET /venues/{venue_id}/metrics — traffic volumes
        - GET /venues/{venue_id}/demographics — visitor demographics
        - GET /venues/{venue_id}/trade-area — visitor origin analysis

        Required parameters for Portland dashboard:
        - venue_ids for Central City / downtown corridors
        - date_range: trailing 12 months
        - granularity: weekly
        """
        base_url = settings.api_keys.placer_base_url
        api_key = settings.api_keys.placer

        # Stub API call — replace with actual endpoint when available
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        # TODO: Replace with real venue IDs for Portland Central City
        venue_id = "PORTLAND_CENTRAL_CITY_VENUE_ID"
        url = f"{base_url}/venues/{venue_id}/metrics"

        resp = requests.get(url, headers=headers, timeout=60)
        resp.raise_for_status()
        return resp.json()

    def _fetch_from_file(self) -> pd.DataFrame:
        """Load the most recent CSV or JSON from the data/placer/ directory."""
        _DATA_DIR.mkdir(parents=True, exist_ok=True)

        # Find most recent data file
        csv_files = sorted(_DATA_DIR.glob("*.csv"), key=lambda p: p.stat().st_mtime, reverse=True)
        json_files = sorted(_DATA_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True)

        if csv_files:
            return pd.read_csv(csv_files[0])
        elif json_files:
            with open(json_files[0]) as f:
                data = json.load(f)
            if isinstance(data, list):
                return pd.DataFrame(data)
            return pd.DataFrame([data])
        else:
            raise EtlError(
                f"No Placer.ai data found. Either configure PLACER_API_KEY "
                f"or drop a CSV/JSON file into {_DATA_DIR}/"
            )

    def validate(self, raw: Any) -> None:
        if isinstance(raw, pd.DataFrame):
            if raw.empty:
                raise EtlError("Placer.ai data file is empty")
        elif isinstance(raw, dict):
            if not raw:
                raise EtlError("Placer.ai API returned empty response")
        else:
            raise EtlError(f"Unexpected raw data type: {type(raw)}")

    def transform(self, raw: Any) -> pd.DataFrame:
        if isinstance(raw, pd.DataFrame):
            df = raw
        elif isinstance(raw, dict):
            # TODO: Adapt to actual API response structure
            records = raw.get("data", raw.get("results", [raw]))
            df = pd.DataFrame(records) if isinstance(records, list) else pd.DataFrame([records])
        else:
            raise EtlError(f"Cannot transform {type(raw)}")

        # Normalize column names
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        # Expected columns after transformation (adapt to actual data):
        # - date / week_start
        # - total_visitors
        # - avg_dwell_time_minutes
        # - repeat_visit_rate
        # - visitor_origin_downtown_pct
        # - visitor_origin_inner_pct
        # - visitor_origin_suburban_pct
        # - visitor_origin_external_pct
        # - corridor (e.g., "CBD", "Pearl", "Old Town", etc.)

        # Parse date columns
        for col in df.columns:
            if "date" in col or "week" in col:
                df[col] = pd.to_datetime(df[col], errors="coerce")

        return df
