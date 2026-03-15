"""
Portland Commons Dashboard — Base ETL Worker

Every data-source worker inherits from BaseWorker and implements
the pipeline stages: fetch -> validate -> transform -> load -> quality_check -> promote.

Data lands in a staging table first, passes quality checks, then is
promoted to the production table in an atomic swap.
"""

from __future__ import annotations

import abc
import hashlib
import time
import traceback
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import psycopg2
import psycopg2.extras
import structlog

from config.settings import settings

logger = structlog.get_logger()


class EtlError(Exception):
    """Raised when a pipeline stage fails in a non-recoverable way."""


class QualityCheckError(EtlError):
    """Raised when data quality checks do not pass."""


class BaseWorker(abc.ABC):
    """Abstract base class for all ETL workers.

    Subclasses must define:
        name            — short identifier, e.g. "ppb_crime"
        staging_table   — e.g. "staging.ppb_crime"
        production_table — e.g. "public.ppb_crime"
        schedule        — one of "daily", "weekly", "monthly", "quarterly", "annual"
    and implement:
        fetch()         — pull raw data, return raw payload (bytes, str, DataFrame, etc.)
        validate(raw)   — sanity-check the raw payload, raise on failure
        transform(raw)  — clean & reshape into a DataFrame ready for load
    Optionally override:
        quality_check(df)  — post-load assertions
        promote()          — staging -> production swap logic
    """

    name: str
    staging_table: str
    production_table: str
    schedule: str  # "daily" | "weekly" | "monthly" | "quarterly" | "annual"

    # ------------------------------------------------------------------ #
    # Pipeline orchestration
    # ------------------------------------------------------------------ #

    def run(self) -> dict[str, Any]:
        """Execute the full pipeline and return a summary dict."""
        run_id = self._run_id()
        log = logger.bind(worker=self.name, run_id=run_id)
        started_at = datetime.now(timezone.utc)
        summary: dict[str, Any] = {"worker": self.name, "run_id": run_id, "status": "started"}

        try:
            log.info("pipeline.start")

            log.info("stage.fetch")
            raw = self.fetch()

            log.info("stage.validate")
            self.validate(raw)

            log.info("stage.transform")
            df = self.transform(raw)
            summary["rows_transformed"] = len(df)

            log.info("stage.load", rows=len(df))
            self.load(df)

            log.info("stage.quality_check")
            self.quality_check(df)

            log.info("stage.promote")
            self.promote()

            summary["status"] = "success"
            log.info("pipeline.success", rows=len(df))

        except Exception as exc:
            summary["status"] = "error"
            summary["error"] = str(exc)
            summary["traceback"] = traceback.format_exc()
            log.error("pipeline.error", error=str(exc))
            self._alert(exc)

        finally:
            summary["duration_seconds"] = (
                datetime.now(timezone.utc) - started_at
            ).total_seconds()
            self._log_run(summary)

        return summary

    # ------------------------------------------------------------------ #
    # Abstract stages (subclass MUST implement)
    # ------------------------------------------------------------------ #

    @abc.abstractmethod
    def fetch(self) -> Any:
        """Pull raw data from the external source."""

    @abc.abstractmethod
    def validate(self, raw: Any) -> None:
        """Validate the raw payload. Raise EtlError on failure."""

    @abc.abstractmethod
    def transform(self, raw: Any) -> pd.DataFrame:
        """Transform raw data into a clean DataFrame."""

    # ------------------------------------------------------------------ #
    # Default implementations (override in subclass if needed)
    # ------------------------------------------------------------------ #

    def load(self, df: pd.DataFrame) -> None:
        """Load DataFrame into the staging table (full replace)."""
        schema, table = self.staging_table.split(".", maxsplit=1)
        with self._connect() as conn:
            with conn.cursor() as cur:
                # Ensure staging schema exists
                cur.execute(f"CREATE SCHEMA IF NOT EXISTS {schema}")
                # Truncate staging table (create if first run)
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS {self.staging_table} (
                        _etl_loaded_at TIMESTAMPTZ DEFAULT NOW()
                    )
                """)
                cur.execute(f"TRUNCATE TABLE {self.staging_table}")

                # Build column list from DataFrame
                cols = list(df.columns)
                # Add columns that don't exist yet
                for col in cols:
                    pg_type = _pandas_dtype_to_pg(df[col])
                    cur.execute(f"""
                        DO $$
                        BEGIN
                            ALTER TABLE {self.staging_table} ADD COLUMN IF NOT EXISTS
                                {col} {pg_type};
                        EXCEPTION WHEN duplicate_column THEN NULL;
                        END $$;
                    """)

                # Bulk insert via COPY-like approach
                if not df.empty:
                    values = [
                        tuple(None if pd.isna(v) else v for v in row)
                        for row in df.itertuples(index=False, name=None)
                    ]
                    insert_sql = (
                        f"INSERT INTO {self.staging_table} ({', '.join(cols)}) "
                        f"VALUES %s"
                    )
                    psycopg2.extras.execute_values(cur, insert_sql, values, page_size=1000)

            conn.commit()

    def quality_check(self, df: pd.DataFrame) -> None:
        """Run post-load quality assertions. Override for source-specific checks.

        Default checks:
        - staging table is not empty
        - row count matches DataFrame
        """
        with self._connect() as conn:
            with conn.cursor() as cur:
                cur.execute(f"SELECT COUNT(*) FROM {self.staging_table}")
                db_count = cur.fetchone()[0]

        if db_count == 0:
            raise QualityCheckError(f"{self.staging_table} is empty after load")

        if db_count != len(df):
            raise QualityCheckError(
                f"Row count mismatch: DataFrame={len(df)}, DB={db_count}"
            )

    def promote(self) -> None:
        """Atomically swap staging data into the production table.

        Strategy: within a transaction, truncate production, insert from staging.
        For tables with foreign keys or large volumes, override with a
        rename-swap approach.
        """
        with self._connect() as conn:
            with conn.cursor() as cur:
                prod_schema = self.production_table.split(".")[0]
                cur.execute(f"CREATE SCHEMA IF NOT EXISTS {prod_schema}")

                # Create production table mirroring staging structure
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS {self.production_table}
                    (LIKE {self.staging_table} INCLUDING ALL)
                """)
                cur.execute(f"TRUNCATE TABLE {self.production_table}")
                cur.execute(f"""
                    INSERT INTO {self.production_table}
                    SELECT * FROM {self.staging_table}
                """)
            conn.commit()

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    def _connect(self) -> psycopg2.extensions.connection:
        return psycopg2.connect(settings.db.url)

    def _run_id(self) -> str:
        raw = f"{self.name}-{time.time_ns()}"
        return hashlib.sha256(raw.encode()).hexdigest()[:12]

    def _log_run(self, summary: dict[str, Any]) -> None:
        """Persist run metadata to the etl_log table."""
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS etl_log (
                            id              SERIAL PRIMARY KEY,
                            run_id          TEXT NOT NULL,
                            worker          TEXT NOT NULL,
                            status          TEXT NOT NULL,
                            rows_transformed INTEGER,
                            duration_seconds REAL,
                            error           TEXT,
                            traceback       TEXT,
                            created_at      TIMESTAMPTZ DEFAULT NOW()
                        )
                    """)
                    cur.execute("""
                        INSERT INTO etl_log
                            (run_id, worker, status, rows_transformed,
                             duration_seconds, error, traceback)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """, (
                        summary.get("run_id"),
                        summary.get("worker"),
                        summary.get("status"),
                        summary.get("rows_transformed"),
                        summary.get("duration_seconds"),
                        summary.get("error"),
                        summary.get("traceback"),
                    ))
                conn.commit()
        except Exception:
            logger.warning("etl_log.write_failed", exc_info=True)

    def _alert(self, exc: Exception) -> None:
        """Send an alert on pipeline failure.

        TODO: Implement Slack webhook and/or email alerts.
        For now, this logs the error and is a no-op for external notification.
        """
        logger.error(
            "alert.pipeline_failure",
            worker=self.name,
            error=str(exc),
        )
        # Slack stub:
        # if settings.alerts.slack_webhook_url:
        #     requests.post(settings.alerts.slack_webhook_url, json={
        #         "text": f":rotating_light: ETL failure: {self.name} — {exc}"
        #     })


def _pandas_dtype_to_pg(series: pd.Series) -> str:
    """Map a pandas Series dtype to a PostgreSQL column type."""
    dtype = series.dtype
    if pd.api.types.is_integer_dtype(dtype):
        return "BIGINT"
    if pd.api.types.is_float_dtype(dtype):
        return "DOUBLE PRECISION"
    if pd.api.types.is_bool_dtype(dtype):
        return "BOOLEAN"
    if pd.api.types.is_datetime64_any_dtype(dtype):
        return "TIMESTAMPTZ"
    return "TEXT"
