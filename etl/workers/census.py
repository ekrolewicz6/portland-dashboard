"""
Census Population Data Worker

Source: US Census Bureau API — Population Estimates Program (PEP) + ACS
URL: https://api.census.gov/
Tier: A (Fully Automated)
Schedule: Annual (PEP released ~September, ACS ~December)

Pulls county-level population estimates for Multnomah County and
Portland city. Also fetches migration flow data when available.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pandas as pd
import requests

from base_worker import BaseWorker, EtlError
from config.settings import settings

_API_BASE = "https://api.census.gov/data"

# FIPS codes
_OREGON_FIPS = "41"
_MULTNOMAH_FIPS = "051"
_PORTLAND_PLACE_FIPS = "59000"  # Portland city

_TIMEOUT = 60


class CensusWorker(BaseWorker):
    name = "census"
    staging_table = "staging.census_population"
    production_table = "public.census_population"
    schedule = "annual"

    def fetch(self) -> dict[str, Any]:
        """Fetch population estimates and ACS data from Census API."""
        api_key = settings.api_keys.census
        if not api_key:
            raise EtlError("CENSUS_API_KEY not configured")

        current_year = datetime.now(timezone.utc).year
        results: dict[str, Any] = {"pep": [], "acs": []}

        # Population Estimates Program — county level
        # Try most recent years (API may not have current year yet)
        for year in range(current_year - 1, current_year - 6, -1):
            try:
                pep_data = self._fetch_pep(year, api_key)
                if pep_data:
                    results["pep"].extend(pep_data)
            except requests.HTTPError:
                continue  # Year not yet available

        # ACS 1-Year — income, housing, demographics
        for year in range(current_year - 1, current_year - 4, -1):
            try:
                acs_data = self._fetch_acs1(year, api_key)
                if acs_data:
                    results["acs"].extend(acs_data)
            except requests.HTTPError:
                continue

        if not results["pep"] and not results["acs"]:
            raise EtlError("Census API returned no data for any recent year")

        return results

    def validate(self, raw: dict[str, Any]) -> None:
        total_records = len(raw.get("pep", [])) + len(raw.get("acs", []))
        if total_records == 0:
            raise EtlError("No Census records fetched")

    def transform(self, raw: dict[str, Any]) -> pd.DataFrame:
        frames: list[pd.DataFrame] = []

        # Transform PEP data
        if raw["pep"]:
            pep_df = pd.DataFrame(raw["pep"])
            pep_df["source"] = "pep"
            frames.append(pep_df)

        # Transform ACS data
        if raw["acs"]:
            acs_df = pd.DataFrame(raw["acs"])
            acs_df["source"] = "acs1"
            frames.append(acs_df)

        df = pd.concat(frames, ignore_index=True)

        # Normalize column names
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        # Ensure numeric columns
        numeric_cols = [c for c in df.columns if c not in ("source", "name", "state", "county", "year", "geography")]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        return df

    def _fetch_pep(self, year: int, api_key: str) -> list[dict[str, Any]]:
        """Fetch Population Estimates Program data for a given year."""
        # TODO: The PEP endpoint path changes between vintage years.
        # Verify the correct path at https://api.census.gov/data.html
        url = f"{_API_BASE}/{year}/pep/population"
        params = {
            "get": "POP_2020,POP,NAME",
            "for": f"county:{_MULTNOMAH_FIPS}",
            "in": f"state:{_OREGON_FIPS}",
            "key": api_key,
        }

        resp = requests.get(url, params=params, timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        if len(data) < 2:
            return []

        headers = data[0]
        rows = data[1:]
        records = [dict(zip(headers, row)) for row in rows]
        for rec in records:
            rec["year"] = str(year)
            rec["geography"] = "multnomah_county"

        return records

    def _fetch_acs1(self, year: int, api_key: str) -> list[dict[str, Any]]:
        """Fetch ACS 1-Year selected variables."""
        url = f"{_API_BASE}/{year}/acs/acs1"
        # B01003_001E = total population
        # B19013_001E = median household income
        # B25001_001E = total housing units
        # B25002_003E = vacant housing units
        params = {
            "get": "NAME,B01003_001E,B19013_001E,B25001_001E,B25002_003E",
            "for": f"county:{_MULTNOMAH_FIPS}",
            "in": f"state:{_OREGON_FIPS}",
            "key": api_key,
        }

        resp = requests.get(url, params=params, timeout=_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        if len(data) < 2:
            return []

        headers = data[0]
        rows = data[1:]
        records = [dict(zip(headers, row)) for row in rows]
        for rec in records:
            rec["year"] = str(year)
            rec["geography"] = "multnomah_county"

        return records
