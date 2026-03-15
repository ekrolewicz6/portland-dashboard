"""
Zillow ZORI (Zillow Observed Rent Index) Worker

Source: Zillow Research Data — free CSV download
URL: https://www.zillow.com/research/data/
Tier: A (Fully Automated)
Schedule: Monthly

Downloads the ZORI CSV at ZIP-code level, filters to Portland-area ZIPs,
and loads monthly rent index values.
"""

from __future__ import annotations

import io

import pandas as pd
import requests

from base_worker import BaseWorker, EtlError

# Zillow publishes ZORI data as CSV. The URL is stable but may change format.
# TODO: Verify this URL is current. Navigate to zillow.com/research/data/,
# select "Rentals" > "ZORI (Zillow Observed Rent Index)" > "ZIP Code".
_ZORI_CSV_URL = (
    "https://files.zillowstatic.com/research/public_csvs/zori/"
    "Zip_zori_uc_sfrcondomfr_sm_month.csv"
)

# Portland-area ZIP codes (Multnomah, Washington, Clackamas counties)
# TODO: Expand or refine this list as needed
_PORTLAND_ZIPS = {
    # Multnomah County core
    "97201", "97202", "97203", "97204", "97205", "97206", "97209", "97210",
    "97211", "97212", "97213", "97214", "97215", "97216", "97217", "97218",
    "97219", "97220", "97221", "97222", "97223", "97224", "97225", "97227",
    "97230", "97231", "97232", "97233", "97236", "97239", "97266",
    # Near suburbs
    "97005", "97006", "97007", "97008",  # Beaverton
    "97034", "97035",  # Lake Oswego
    "97060",  # Troutdale
    "97080",  # Gresham (partial)
    "97086",  # Happy Valley
}

_TIMEOUT = 60


class ZillowRentsWorker(BaseWorker):
    name = "zillow_rents"
    staging_table = "staging.zillow_rents"
    production_table = "public.zillow_rents"
    schedule = "monthly"

    def fetch(self) -> str:
        """Download the ZORI CSV from Zillow Research."""
        resp = requests.get(_ZORI_CSV_URL, timeout=_TIMEOUT)
        resp.raise_for_status()

        if len(resp.content) < 1000:
            raise EtlError(
                f"ZORI CSV suspiciously small ({len(resp.content)} bytes)"
            )

        return resp.text

    def validate(self, raw: str) -> None:
        df = pd.read_csv(io.StringIO(raw), nrows=3)
        if "RegionName" not in df.columns:
            raise EtlError(
                f"ZORI CSV missing 'RegionName' column. Found: {list(df.columns)[:10]}"
            )

    def transform(self, raw: str) -> pd.DataFrame:
        df = pd.read_csv(io.StringIO(raw), dtype={"RegionName": str})

        # Filter to Portland-area ZIPs
        df = df[df["RegionName"].isin(_PORTLAND_ZIPS)].copy()

        if df.empty:
            raise EtlError("No Portland-area ZIPs found in ZORI data")

        # Melt from wide (one col per month) to long format
        id_cols = [c for c in df.columns if not c.startswith("20")]
        date_cols = [c for c in df.columns if c.startswith("20")]

        df_long = df.melt(
            id_vars=id_cols,
            value_vars=date_cols,
            var_name="month",
            value_name="zori",
        )

        # Normalize
        df_long.columns = [
            c.strip().lower().replace(" ", "_") for c in df_long.columns
        ]

        if "regionname" in df_long.columns:
            df_long = df_long.rename(columns={"regionname": "zip_code"})

        df_long["month"] = pd.to_datetime(df_long["month"], errors="coerce")
        df_long["zori"] = pd.to_numeric(df_long["zori"], errors="coerce")

        # Drop rows with no rent data
        df_long = df_long.dropna(subset=["zori"])

        return df_long
