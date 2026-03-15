"""
BLS Employment Data Worker

Source: Bureau of Labor Statistics API v2
URL: https://api.bls.gov/publicAPI/v2/timeseries/data/
Tier: A (Fully Automated)
Schedule: Monthly (employment data ~6 weeks lag)

Pulls Portland MSA employment and unemployment data via the BLS public API.
Series IDs for Portland-Vancouver-Hillsboro MSA are published at:
https://www.bls.gov/eag/eag.or_portland.htm
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pandas as pd
import requests

from base_worker import BaseWorker, EtlError
from config.settings import settings

_BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

# Portland-Vancouver-Hillsboro MSA series IDs
# TODO: Verify these series IDs at https://www.bls.gov/eag/eag.or_portland.htm
_SERIES_IDS = {
    # Current Employment Statistics (CES)
    "total_nonfarm": "SMU41384600000000001",     # Total nonfarm employment
    "construction": "SMU41384602000000001",       # Construction
    "manufacturing": "SMU41384603000000001",      # Manufacturing
    "trade_transport": "SMU41384604000000001",    # Trade, Transportation, Utilities
    "professional": "SMU41384606054000001",       # Professional & Business Services
    "leisure_hospitality": "SMU41384607000000001", # Leisure & Hospitality
    "government": "SMU41384609000000001",         # Government

    # Local Area Unemployment Statistics (LAUS)
    "unemployment_rate": "LAUST410000000000003",  # Oregon unemployment rate
    # TODO: Find Portland MSA unemployment rate series ID
}

_TIMEOUT = 60


class BlsEmploymentWorker(BaseWorker):
    name = "bls_employment"
    staging_table = "staging.bls_employment"
    production_table = "public.bls_employment"
    schedule = "monthly"

    def fetch(self) -> dict[str, Any]:
        """Query BLS API for all configured series."""
        api_key = settings.api_keys.bls
        if not api_key:
            raise EtlError("BLS_API_KEY not configured")

        current_year = datetime.now(timezone.utc).year
        start_year = current_year - 5  # 5 years of history

        # BLS API accepts up to 50 series per request
        payload = {
            "seriesid": list(_SERIES_IDS.values()),
            "startyear": str(start_year),
            "endyear": str(current_year),
            "registrationkey": api_key,
        }

        resp = requests.post(_BLS_API_URL, json=payload, timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        if data.get("status") != "REQUEST_SUCCEEDED":
            raise EtlError(
                f"BLS API request failed: {data.get('message', 'Unknown error')}"
            )

        return data

    def validate(self, raw: dict[str, Any]) -> None:
        results = raw.get("Results", {}).get("series", [])
        if not results:
            raise EtlError("BLS API returned no series data")

        # Check that at least some series have observations
        total_obs = sum(len(s.get("data", [])) for s in results)
        if total_obs == 0:
            raise EtlError("BLS API returned series but no observations")

    def transform(self, raw: dict[str, Any]) -> pd.DataFrame:
        # Build a reverse lookup: series_id -> human name
        id_to_name = {v: k for k, v in _SERIES_IDS.items()}

        rows: list[dict[str, Any]] = []
        for series in raw["Results"]["series"]:
            series_id = series["seriesID"]
            series_name = id_to_name.get(series_id, series_id)

            for obs in series.get("data", []):
                period = obs.get("period", "")
                if not period.startswith("M"):
                    continue  # Skip annual averages (M13)

                month_num = int(period[1:])
                if month_num > 12:
                    continue

                year = int(obs["year"])
                rows.append({
                    "series_id": series_id,
                    "series_name": series_name,
                    "year": year,
                    "month": month_num,
                    "period_date": f"{year}-{month_num:02d}-01",
                    "value": float(obs["value"]),
                    "footnotes": "; ".join(
                        fn.get("text", "") for fn in obs.get("footnotes", []) if fn.get("text")
                    ),
                })

        df = pd.DataFrame(rows)
        df["period_date"] = pd.to_datetime(df["period_date"])

        return df

    def quality_check(self, df: pd.DataFrame) -> None:
        super().quality_check(df)

        # Ensure we have at least a few series
        n_series = df["series_name"].nunique()
        if n_series < 3:
            raise EtlError(
                f"Only {n_series} BLS series returned; expected at least 3"
            )
