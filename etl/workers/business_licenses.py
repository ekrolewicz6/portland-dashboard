"""
CivicApps Business License Worker

Source: CivicApps API — Portland business license registrations
URL: http://api.civicapps.org/business-licenses/
Tier: A (Fully Automated)
Schedule: Weekly

Pulls rolling 12 months of new business license data. No authentication
required. Paginated via `page` parameter (100 results per page).

Limitation: This API provides new registrations only, not closures.
For net business formation, BLT registration data (via public records
request) is also needed.
"""

from __future__ import annotations

from typing import Any

import pandas as pd
import requests
import structlog

from base_worker import BaseWorker, EtlError

logger = structlog.get_logger()

_API_BASE = "http://api.civicapps.org/business-licenses/"
_TIMEOUT = 30
_MAX_PAGES = 500  # Safety limit
_PAGE_SIZE = 100  # Expected results per page


class BusinessLicenseWorker(BaseWorker):
    name = "business_licenses"
    staging_table = "business.civicapps_licenses_staging"
    production_table = "business.civicapps_licenses"
    schedule = "weekly"

    def fetch(self) -> list[dict[str, Any]]:
        """Paginate through CivicApps business license API."""
        all_records: list[dict[str, Any]] = []
        page = 1

        while page <= _MAX_PAGES:
            logger.debug("business_licenses.fetch_page", page=page)
            resp = requests.get(
                _API_BASE,
                params={"page": page},
                timeout=_TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()

            # CivicApps returns {"results": [...], "count": N, ...}
            results = data.get("results", data.get("data", []))
            if not results:
                break

            all_records.extend(results)
            page += 1

            # Stop if we've consumed all pages
            total = data.get("count", data.get("total", None))
            if total is not None and len(all_records) >= total:
                break

            logger.info(
                "business_licenses.progress",
                fetched=len(all_records),
                total=total,
            )

        if not all_records:
            raise EtlError("CivicApps returned zero business license records")

        logger.info("business_licenses.fetched", count=len(all_records))
        return all_records

    def validate(self, raw: list[dict[str, Any]]) -> None:
        if not raw:
            raise EtlError("Empty business license result set")

        sample = raw[0]
        expected = {"business_name", "address"}
        actual = set(sample.keys())
        missing = expected - actual
        if missing:
            raise EtlError(
                f"Business license records missing expected fields: {missing}. "
                f"Sample fields: {sorted(actual)}"
            )

    def transform(self, raw: list[dict[str, Any]]) -> pd.DataFrame:
        df = pd.DataFrame(raw)

        # Normalize column names
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

        # Parse date columns
        date_candidates = ["date_added", "created_date", "registration_date"]
        for col in date_candidates:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col], errors="coerce")

        # Extract NAICS sector (first 2 digits)
        if "naics_code" in df.columns:
            df["naics_sector"] = df["naics_code"].astype(str).str[:2]

        # Derive registration month
        date_col = next((c for c in date_candidates if c in df.columns), None)
        if date_col:
            df["registration_month"] = df[date_col].dt.to_period("M").astype(str)

        # Extract ZIP from address if not a separate field
        if "zip_code" not in df.columns and "address" in df.columns:
            df["zip_code"] = (
                df["address"]
                .astype(str)
                .str.extract(r"(\d{5})(?:-\d{4})?$", expand=False)
            )

        # Ensure key output columns exist (fill with None if API doesn't provide)
        for col in ("business_name", "address", "naics_code", "date_added",
                     "lat", "lon", "zip_code"):
            if col not in df.columns:
                df[col] = None

        return df
