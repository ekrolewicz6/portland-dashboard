"""
IRS SOI Migration Data Worker

Source: IRS Statistics of Income — County-to-County Migration
URL: https://www.irs.gov/statistics/soi-tax-stats-migration-data
Tier: A (Fully Automated)
Schedule: Annual (data published ~18 months after tax year)

Downloads county-level inflow/outflow CSV files, filters to Multnomah County,
and computes net migration (returns and AGI).

Key derived metric: Net AGI migration = total AGI moving in minus total AGI
moving out. This reveals whether departing households are wealthier than
arriving ones (critical for the tax-burden narrative).
"""

from __future__ import annotations

import io
import re
from typing import Any

import pandas as pd
import requests
from bs4 import BeautifulSoup

from base_worker import BaseWorker, EtlError

_IRS_PAGE_URL = "https://www.irs.gov/statistics/soi-tax-stats-migration-data"

# Multnomah County FIPS
_STATE_FIPS = "41"
_COUNTY_FIPS = "051"

_TIMEOUT = 120


class IrsMigrationWorker(BaseWorker):
    name = "irs_migration"
    staging_table = "staging.irs_migration"
    production_table = "public.irs_migration"
    schedule = "annual"

    def fetch(self) -> dict[str, str]:
        """Find and download the latest inflow and outflow CSVs."""
        # Scrape the IRS page for download links
        page_resp = requests.get(_IRS_PAGE_URL, timeout=_TIMEOUT)
        page_resp.raise_to_status() if False else None  # noqa: keep for pattern
        page_resp.raise_for_status()

        soup = BeautifulSoup(page_resp.text, "lxml")
        inflow_url, outflow_url = self._find_csv_urls(soup)

        if not inflow_url or not outflow_url:
            # TODO: Fall back to known URL pattern if page scraping fails.
            # Typical pattern:
            #   https://www.irs.gov/pub/irs-soi/county{yy}in.csv
            #   https://www.irs.gov/pub/irs-soi/county{yy}out.csv
            raise EtlError(
                "Could not find IRS migration CSV download links. "
                "Page structure may have changed."
            )

        inflow_resp = requests.get(inflow_url, timeout=_TIMEOUT)
        inflow_resp.raise_for_status()

        outflow_resp = requests.get(outflow_url, timeout=_TIMEOUT)
        outflow_resp.raise_for_status()

        return {
            "inflow": inflow_resp.text,
            "outflow": outflow_resp.text,
        }

    def validate(self, raw: dict[str, str]) -> None:
        for direction in ("inflow", "outflow"):
            csv_text = raw.get(direction, "")
            if not csv_text or len(csv_text) < 200:
                raise EtlError(f"IRS migration {direction} CSV is empty or too small")

    def transform(self, raw: dict[str, str]) -> pd.DataFrame:
        frames: list[pd.DataFrame] = []

        for direction in ("inflow", "outflow"):
            df = pd.read_csv(io.StringIO(raw[direction]), dtype=str)
            df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

            # TODO: Confirm exact column names. Typical IRS SOI columns:
            # y1_statefips, y1_countyfips (origin), y2_statefips, y2_countyfips (dest),
            # n1 (returns), n2 (exemptions/people), agi (adjusted gross income)

            # Filter to Multnomah County
            if direction == "inflow":
                # Inflow = destination is Multnomah
                state_col = next((c for c in df.columns if "y2_state" in c or "dest_state" in c), None)
                county_col = next((c for c in df.columns if "y2_county" in c or "dest_county" in c), None)
            else:
                # Outflow = origin is Multnomah
                state_col = next((c for c in df.columns if "y1_state" in c or "orig_state" in c), None)
                county_col = next((c for c in df.columns if "y1_county" in c or "orig_county" in c), None)

            if state_col and county_col:
                df = df[
                    (df[state_col].str.strip() == _STATE_FIPS)
                    & (df[county_col].str.strip() == _COUNTY_FIPS)
                ]

            df["direction"] = direction

            # Convert numeric columns
            for col in df.columns:
                if col not in ("direction",) and not col.endswith("fips"):
                    df[col] = pd.to_numeric(df[col], errors="coerce")

            frames.append(df)

        if not frames:
            raise EtlError("No IRS migration data after filtering")

        result = pd.concat(frames, ignore_index=True)
        return result

    @staticmethod
    def _find_csv_urls(soup: BeautifulSoup) -> tuple[str | None, str | None]:
        """Extract inflow and outflow CSV links from the IRS page."""
        inflow_url = None
        outflow_url = None

        for link in soup.find_all("a", href=True):
            href = link["href"]
            lower_href = href.lower()
            if "county" in lower_href and lower_href.endswith(".csv"):
                if "in" in lower_href and not "out" in lower_href:
                    inflow_url = href if href.startswith("http") else f"https://www.irs.gov{href}"
                elif "out" in lower_href:
                    outflow_url = href if href.startswith("http") else f"https://www.irs.gov{href}"

        return inflow_url, outflow_url
