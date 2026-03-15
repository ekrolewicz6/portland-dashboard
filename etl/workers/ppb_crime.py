"""
PPB Crime Data Worker

Source: Portland Police Bureau open data — Tableau dashboard CSV exports.
URL: https://www.portland.gov/police/open-data/reported-crime-data
Tier: B (Semi-Automated)
Schedule: Monthly (~30 days after month end)

The PPB publishes yearly CSV files via Tableau Public. This worker downloads
the current-year file, parses it, and loads offense-level records into the
database. Historical years are backfilled on first run.
"""

from __future__ import annotations

import io
from datetime import datetime, timezone

import pandas as pd
import requests

from base_worker import BaseWorker, EtlError

# TODO: Verify these URLs against the current Tableau Public embed.
# The download links change when PPB republishes; inspect the page's
# network requests to find the latest CSV export URL.
_BASE_URL = "https://www.portland.gov/police/open-data/reported-crime-data"

# Known Tableau CSV export pattern (inspect page to confirm):
# TODO: Replace with actual Tableau CSV download URL pattern
_CSV_URL_TEMPLATE = (
    "https://public.tableau.com/views/PPBOpenDataCrimeStatistics/"
    "CrimeData.csv?:showVizHome=no"
)


class PpbCrimeWorker(BaseWorker):
    name = "ppb_crime"
    staging_table = "staging.ppb_crime"
    production_table = "public.ppb_crime"
    schedule = "monthly"

    def fetch(self) -> str:
        """Download the current-year crime CSV from Tableau Public."""
        # TODO: The actual download mechanism may require:
        # 1. Hitting the portland.gov page to find the embedded Tableau viz URL
        # 2. Constructing the CSV download URL from the viz path
        # 3. Handling any anti-bot measures (User-Agent, cookies)

        current_year = datetime.now(timezone.utc).year
        url = _CSV_URL_TEMPLATE
        headers = {
            "User-Agent": "PortlandCommonsDashboard/1.0 (civic data project)",
        }

        response = requests.get(url, headers=headers, timeout=120)
        response.raise_for_status()

        if len(response.content) < 500:
            raise EtlError(
                f"PPB crime CSV response too small ({len(response.content)} bytes), "
                "likely an error page"
            )

        return response.text

    def validate(self, raw: str) -> None:
        """Check that the CSV has expected columns."""
        df = pd.read_csv(io.StringIO(raw), nrows=5)

        # TODO: Confirm exact column names from the actual CSV download
        expected_cols = {"Offense Type", "Neighborhood", "Report Date"}
        actual_cols = set(df.columns)
        missing = expected_cols - actual_cols
        if missing:
            raise EtlError(
                f"PPB crime CSV missing expected columns: {missing}. "
                f"Found: {sorted(actual_cols)}"
            )

    def transform(self, raw: str) -> pd.DataFrame:
        """Parse CSV into cleaned DataFrame."""
        df = pd.read_csv(io.StringIO(raw))

        # Normalize column names to snake_case
        df.columns = [
            c.strip().lower().replace(" ", "_").replace("-", "_")
            for c in df.columns
        ]

        # TODO: Adjust column names once actual CSV structure is confirmed
        rename_map = {
            "report_date": "report_date",
            "offense_type": "offense_type",
            "offense_category": "offense_category",
            "neighborhood": "neighborhood",
            "case_number": "case_number",
            "address": "block_address",
        }
        # Only rename columns that exist
        rename_map = {k: v for k, v in rename_map.items() if k in df.columns}
        df = df.rename(columns=rename_map)

        # Parse dates
        if "report_date" in df.columns:
            df["report_date"] = pd.to_datetime(df["report_date"], errors="coerce")

        # Derive month key for aggregation
        if "report_date" in df.columns:
            df["report_month"] = df["report_date"].dt.to_period("M").astype(str)

        # Drop fully-null rows
        df = df.dropna(how="all")

        return df

    def quality_check(self, df: pd.DataFrame) -> None:
        """PPB-specific quality assertions."""
        super().quality_check(df)

        if "report_date" in df.columns:
            null_dates = df["report_date"].isna().sum()
            null_pct = null_dates / len(df)
            if null_pct > 0.05:
                raise EtlError(
                    f"PPB crime data has {null_pct:.0%} null report_dates"
                )
