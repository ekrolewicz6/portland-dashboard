"""
Portland Commons Dashboard — ETL Configuration

Loads settings from environment variables with sensible defaults.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

# Load .env from the etl directory (two levels up from config/)
_ETL_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_ETL_ROOT / ".env")


@dataclass(frozen=True, slots=True)
class DatabaseConfig:
    url: str = field(default_factory=lambda: os.environ.get(
        "DATABASE_URL",
        "postgresql://localhost:5432/portland_commons",
    ))
    staging_schema: str = field(default_factory=lambda: os.environ.get(
        "ETL_STAGING_SCHEMA", "staging",
    ))
    production_schema: str = field(default_factory=lambda: os.environ.get(
        "ETL_PRODUCTION_SCHEMA", "public",
    ))


@dataclass(frozen=True, slots=True)
class ApiKeys:
    census: str = field(default_factory=lambda: os.environ.get("CENSUS_API_KEY", ""))
    bls: str = field(default_factory=lambda: os.environ.get("BLS_API_KEY", ""))
    trimet_app_id: str = field(default_factory=lambda: os.environ.get("TRIMET_APP_ID", ""))
    placer: str = field(default_factory=lambda: os.environ.get("PLACER_API_KEY", ""))
    placer_base_url: str = field(default_factory=lambda: os.environ.get(
        "PLACER_BASE_URL", "https://api.placer.ai/v1",
    ))


@dataclass(frozen=True, slots=True)
class AlertConfig:
    slack_webhook_url: str = field(default_factory=lambda: os.environ.get("SLACK_WEBHOOK_URL", ""))
    alert_email: str = field(default_factory=lambda: os.environ.get("ALERT_EMAIL", ""))


@dataclass(frozen=True, slots=True)
class EtlConfig:
    log_level: str = field(default_factory=lambda: os.environ.get("ETL_LOG_LEVEL", "INFO"))
    data_dir: Path = field(default_factory=lambda: Path(
        os.environ.get("ETL_DATA_DIR", str(_ETL_ROOT / "data")),
    ))
    max_retries: int = field(default_factory=lambda: int(
        os.environ.get("ETL_MAX_RETRIES", "3"),
    ))
    retry_delay_seconds: int = field(default_factory=lambda: int(
        os.environ.get("ETL_RETRY_DELAY_SECONDS", "60"),
    ))


@dataclass(frozen=True, slots=True)
class Settings:
    db: DatabaseConfig = field(default_factory=DatabaseConfig)
    api_keys: ApiKeys = field(default_factory=ApiKeys)
    alerts: AlertConfig = field(default_factory=AlertConfig)
    etl: EtlConfig = field(default_factory=EtlConfig)


# Singleton — import this from anywhere
settings = Settings()
