"""
HUD USPS Vacancy Data Worker

Source: HUD User — USPS vacancy data by census tract
URL: https://www.huduser.gov/portal/datasets/usps.html
Tier: A (Fully Automated)
Schedule: Quarterly

Downloads the latest USPS vacancy CSV from HUD, filters to Multnomah County
census tracts, and loads residential + commercial vacancy rates.
"""

from __future__ import annotations

import io
import re
from datetime import datetime, timezone

import pandas as pd
import requests
from bs4 import BeautifulSoup

from base_worker import BaseWorker, EtlError
from config.settings import settings

_HUD_PAGE_URL = "https://www.huduser.gov/portal/datasets/usps.html"

# Multnomah County FIPS: Oregon=41, Multnomah=051
_MULTNOMAH_COUNTY_FIPS = "41051"

_TIMEOUT = 120


class HudVacancyWorker(BaseWorker):
    name = "hud_vacancy"
    staging_table = "staging.hud_vacancy"
    production_table = "public.hud_vacancy"
    schedule = "quarterly"

    def fetch(self) -> str:
        """Scrape the HUD page for the latest vacancy CSV link, then download it."""
        # Step 1: Find the CSV download link
        page_resp = requests.get(_HUD_PAGE_URL, timeout=_TIMEOUT)
        page_resp.raise_for_status()

        soup = BeautifulSoup(page_resp.text, "lxml")
        csv_url = self._find_latest_csv_url(soup)

        if not csv_url:
            # TODO: The HUD page structure may change. If scraping fails,
            # fall back to a known direct URL pattern.
            raise EtlError(
                "Could not find vacancy CSV download link on HUD page. "
                "Page structure may have changed."
            )

        # Step 2: Download the CSV
        csv_resp = requests.get(csv_url, timeout=_TIMEOUT)
        csv_resp.raise_for_status()

        return csv_resp.text

    def validate(self, raw: str) -> None:
        df = pd.read_csv(io.StringIO(raw), nrows=5)
        # TODO: Confirm exact column names from the actual HUD CSV
        if df.empty:
            raise EtlError("HUD vacancy CSV is empty")

    def transform(self, raw: str) -> pd.DataFrame:
        df = pd.read_csv(io.StringIO(raw), dtype=str)

        # Normalize column names
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        # TODO: Adjust filtering logic based on actual column names.
        # HUD data typically has a 'geoid' or 'tract' column and a 'county' column.
        county_col = next(
            (c for c in df.columns if "county" in c or "fips" in c or "geoid" in c),
            None,
        )
        if county_col:
            # Filter to Multnomah County tracts
            df = df[df[county_col].astype(str).str.startswith(_MULTNOMAH_COUNTY_FIPS)]

        # Convert numeric columns
        numeric_candidates = [
            c for c in df.columns
            if any(kw in c for kw in ("vacant", "occupied", "total", "rate", "count"))
        ]
        for col in numeric_candidates:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        if df.empty:
            raise EtlError(
                f"No Multnomah County tracts found in HUD data "
                f"(filtering on FIPS prefix '{_MULTNOMAH_COUNTY_FIPS}')"
            )

        return df

    @staticmethod
    def _find_latest_csv_url(soup: BeautifulSoup) -> str | None:
        """Extract the most recent CSV download link from the HUD page."""
        for link in soup.find_all("a", href=True):
            href = link["href"]
            if re.search(r"(?i)\.csv", href) and "tract" in href.lower():
                if not href.startswith("http"):
                    href = f"https://www.huduser.gov{href}"
                return href
        return None
