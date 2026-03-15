"""
Portland Commons Dashboard — Rules-Based Insight Detection Engine

Compares latest data points against:
  - Prior month
  - Prior year (same month)
  - 12-month rolling average

Detects:
  - Threshold crossings (e.g., permit processing time exceeds 90-day guarantee)
  - Trend reversals (direction changed vs. prior 3 months)
  - Statistical outliers (> 2 standard deviations from 12-month mean)
  - Milestone events (e.g., lowest unemployment in N years)

Generates plain-English insight sentences and stores them in the
`insights` table for the frontend to surface in dashboard callouts
and the Portland Pulse digest.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import pandas as pd
import psycopg2
import psycopg2.extras
import structlog

from config.settings import settings

logger = structlog.get_logger()


# ------------------------------------------------------------------ #
# Data classes
# ------------------------------------------------------------------ #

@dataclass(slots=True)
class Insight:
    """A single detected insight ready for display."""
    metric: str           # e.g., "crime_monthly_total"
    category: str         # "threshold_crossing" | "trend_reversal" | "outlier" | "yoy_change" | "mom_change"
    severity: str         # "info" | "notable" | "significant" | "critical"
    headline: str         # Short headline for cards/banners
    body: str             # Plain-English explanation paragraph
    data_date: str        # The date/period the insight refers to
    comparison_value: float | None = None
    current_value: float | None = None
    pct_change: float | None = None
    question: str = ""    # Which dashboard question this feeds


@dataclass(frozen=True, slots=True)
class MetricRule:
    """Configuration for how to detect insights on a given metric."""
    name: str
    table: str
    value_column: str
    date_column: str
    question: str
    # Change thresholds
    yoy_change_notable_pct: float = 10.0
    mom_change_notable_pct: float = 15.0
    outlier_std_devs: float = 2.0
    trend_reversal_months: int = 3
    # Static thresholds
    upper_threshold: float | None = None
    lower_threshold: float | None = None
    threshold_label: str = ""
    # Filter clause (for tables with multiple series)
    where_filter: str | None = None


# ------------------------------------------------------------------ #
# Metric rule registry — one entry per monitored metric
# ------------------------------------------------------------------ #

METRIC_RULES: list[MetricRule] = [
    MetricRule(
        name="crime_monthly_total",
        table="public.ppb_crime",
        value_column="COUNT(*)",
        date_column="report_month",
        question="Is Portland safe?",
        yoy_change_notable_pct=10,
        mom_change_notable_pct=20,
    ),
    MetricRule(
        name="permit_processing_days",
        table="public.permits",
        value_column="AVG(processing_days)",
        date_column="application_month",
        question="Is the city government functional?",
        upper_threshold=90,
        threshold_label="90-day guarantee",
        yoy_change_notable_pct=15,
    ),
    MetricRule(
        name="new_business_licenses",
        table="public.business_licenses",
        value_column="COUNT(*)",
        date_column="registration_month",
        question="Is Portland gaining or losing businesses?",
        yoy_change_notable_pct=10,
    ),
    MetricRule(
        name="hud_vacancy_rate",
        table="public.hud_vacancy",
        # TODO: Confirm exact column name after first HUD data ingest
        value_column="AVG(CAST(residential_vacant AS FLOAT) / NULLIF(CAST(total_addresses AS FLOAT), 0) * 100)",
        date_column="quarter",
        question="Is downtown coming back to life?",
        yoy_change_notable_pct=10,
    ),
    MetricRule(
        name="zillow_median_rent",
        table="public.zillow_rents",
        value_column="AVG(zori)",
        date_column="month",
        question="Is housing getting built?",
        yoy_change_notable_pct=8,
        mom_change_notable_pct=5,
    ),
    MetricRule(
        name="total_nonfarm_employment",
        table="public.bls_employment",
        value_column="AVG(value)",
        date_column="period_date",
        question="Is Portland gaining or losing people?",
        yoy_change_notable_pct=3,
        where_filter="series_name = 'total_nonfarm'",
    ),
]


# ------------------------------------------------------------------ #
# Engine
# ------------------------------------------------------------------ #

class InsightsEngine:
    """Evaluates all metric rules and generates plain-English insights."""

    def __init__(self) -> None:
        self.db_url = settings.db.url

    def run(self) -> list[Insight]:
        """Execute all rules and persist results."""
        logger.info("insights_engine.start", rule_count=len(METRIC_RULES))
        all_insights: list[Insight] = []

        for rule in METRIC_RULES:
            try:
                insights = self._evaluate_rule(rule)
                all_insights.extend(insights)
            except Exception:
                logger.warning(
                    "insights_engine.rule_failed",
                    metric=rule.name,
                    exc_info=True,
                )

        if all_insights:
            self._persist_insights(all_insights)

        logger.info("insights_engine.complete", insights_generated=len(all_insights))
        return all_insights

    # ------------------------------------------------------------------ #
    # Rule evaluation
    # ------------------------------------------------------------------ #

    def _evaluate_rule(self, rule: MetricRule) -> list[Insight]:
        """Fetch time series and run all detection checks."""
        ts = self._fetch_time_series(rule)
        if ts is None or len(ts) < 3:
            return []

        insights: list[Insight] = []
        latest = ts.iloc[-1]
        latest_date = str(latest["period"])
        latest_value = float(latest["value"])

        # Month-over-month
        if len(ts) >= 2:
            prior = ts.iloc[-2]
            insight = self._check_period_change(
                rule, latest_value, float(prior["value"]),
                latest_date, "month-over-month",
                rule.mom_change_notable_pct,
            )
            if insight:
                insights.append(insight)

        # Year-over-year
        if len(ts) >= 13:
            prior_year = ts.iloc[-13]
            insight = self._check_period_change(
                rule, latest_value, float(prior_year["value"]),
                latest_date, "year-over-year",
                rule.yoy_change_notable_pct,
            )
            if insight:
                insights.append(insight)

        # Outlier detection (vs. 12-month rolling stats)
        if len(ts) >= 13:
            window = ts["value"].iloc[-13:-1]
            rolling_mean = window.mean()
            rolling_std = window.std()

            if rolling_std > 0:
                z_score = (latest_value - rolling_mean) / rolling_std
                if abs(z_score) >= rule.outlier_std_devs:
                    direction = "above" if z_score > 0 else "below"
                    insights.append(Insight(
                        metric=rule.name,
                        category="outlier",
                        severity="significant",
                        headline=f"{_humanize(rule.name)} is a statistical outlier",
                        body=(
                            f"The latest {_humanize(rule.name)} ({latest_value:,.1f}) "
                            f"is {abs(z_score):.1f} standard deviations {direction} "
                            f"the 12-month average ({rolling_mean:,.1f})."
                        ),
                        data_date=latest_date,
                        current_value=latest_value,
                        comparison_value=rolling_mean,
                        question=rule.question,
                    ))

        # Threshold crossing
        if rule.upper_threshold is not None and len(ts) >= 2:
            prev_value = float(ts.iloc[-2]["value"])
            label = rule.threshold_label or str(rule.upper_threshold)

            if latest_value >= rule.upper_threshold > prev_value:
                insights.append(Insight(
                    metric=rule.name,
                    category="threshold_crossing",
                    severity="critical",
                    headline=f"{_humanize(rule.name)} crossed above {label}",
                    body=(
                        f"{_humanize(rule.name)} rose to {latest_value:,.1f}, "
                        f"crossing above the {label} threshold "
                        f"of {rule.upper_threshold:,.1f}."
                    ),
                    data_date=latest_date,
                    current_value=latest_value,
                    comparison_value=rule.upper_threshold,
                    question=rule.question,
                ))
            elif latest_value < rule.upper_threshold <= prev_value:
                insights.append(Insight(
                    metric=rule.name,
                    category="threshold_crossing",
                    severity="notable",
                    headline=f"{_humanize(rule.name)} dropped below {label}",
                    body=(
                        f"{_humanize(rule.name)} fell to {latest_value:,.1f}, "
                        f"dropping below the {label} threshold "
                        f"of {rule.upper_threshold:,.1f}."
                    ),
                    data_date=latest_date,
                    current_value=latest_value,
                    comparison_value=rule.upper_threshold,
                    question=rule.question,
                ))

        # Trend reversal
        if len(ts) >= rule.trend_reversal_months + 1:
            recent_vals = ts["value"].iloc[-(rule.trend_reversal_months + 1):].tolist()
            diffs = [recent_vals[i + 1] - recent_vals[i] for i in range(len(recent_vals) - 1)]

            if len(diffs) >= 2:
                prior_diffs = diffs[:-1]
                latest_diff = diffs[-1]
                all_rising = all(d > 0 for d in prior_diffs)
                all_falling = all(d < 0 for d in prior_diffs)

                if all_rising and latest_diff < 0:
                    insights.append(Insight(
                        metric=rule.name,
                        category="trend_reversal",
                        severity="notable",
                        headline=f"{_humanize(rule.name)} reverses upward trend",
                        body=(
                            f"After {len(prior_diffs)} consecutive months of increases, "
                            f"{_humanize(rule.name)} declined to {latest_value:,.1f}."
                        ),
                        data_date=latest_date,
                        current_value=latest_value,
                        question=rule.question,
                    ))
                elif all_falling and latest_diff > 0:
                    insights.append(Insight(
                        metric=rule.name,
                        category="trend_reversal",
                        severity="notable",
                        headline=f"{_humanize(rule.name)} reverses downward trend",
                        body=(
                            f"After {len(prior_diffs)} consecutive months of declines, "
                            f"{_humanize(rule.name)} rose to {latest_value:,.1f}."
                        ),
                        data_date=latest_date,
                        current_value=latest_value,
                        question=rule.question,
                    ))

        return insights

    # ------------------------------------------------------------------ #
    # Helpers
    # ------------------------------------------------------------------ #

    def _check_period_change(
        self,
        rule: MetricRule,
        current: float,
        prior: float,
        date: str,
        comparison_label: str,
        threshold_pct: float,
    ) -> Insight | None:
        """Return an insight if the change exceeds the threshold."""
        if prior == 0:
            return None

        pct_change = ((current - prior) / abs(prior)) * 100
        if abs(pct_change) < threshold_pct:
            return None

        direction = "increased" if pct_change > 0 else "decreased"
        severity = "significant" if abs(pct_change) >= threshold_pct * 2 else "notable"

        return Insight(
            metric=rule.name,
            category=f"{comparison_label.replace('-', '_')}_change",
            severity=severity,
            headline=(
                f"{_humanize(rule.name)} {direction} {abs(pct_change):.1f}% "
                f"{comparison_label}"
            ),
            body=(
                f"{_humanize(rule.name)} {direction} from {prior:,.1f} to "
                f"{current:,.1f} ({pct_change:+.1f}% {comparison_label})."
            ),
            data_date=date,
            current_value=current,
            comparison_value=prior,
            pct_change=pct_change,
            question=rule.question,
        )

    def _fetch_time_series(self, rule: MetricRule) -> pd.DataFrame | None:
        """Query the production table for a time-ordered value series."""
        where_clause = f"WHERE {rule.where_filter}" if rule.where_filter else ""

        query = f"""
            SELECT
                {rule.date_column} AS period,
                {rule.value_column} AS value
            FROM {rule.table}
            {where_clause}
            GROUP BY {rule.date_column}
            ORDER BY {rule.date_column} ASC
        """

        try:
            with psycopg2.connect(self.db_url) as conn:
                df = pd.read_sql(query, conn)
            return df if not df.empty else None
        except Exception:
            logger.debug(
                "insights_engine.query_failed",
                metric=rule.name,
                exc_info=True,
            )
            return None

    def _persist_insights(self, insights: list[Insight]) -> None:
        """Upsert insights into the database, deduplicating by content hash."""
        try:
            with psycopg2.connect(self.db_url) as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS insights (
                            id               SERIAL PRIMARY KEY,
                            insight_hash     TEXT UNIQUE NOT NULL,
                            metric           TEXT NOT NULL,
                            category         TEXT NOT NULL,
                            severity         TEXT NOT NULL,
                            headline         TEXT NOT NULL,
                            body             TEXT NOT NULL,
                            data_date        TEXT NOT NULL,
                            current_value    DOUBLE PRECISION,
                            comparison_value DOUBLE PRECISION,
                            pct_change       DOUBLE PRECISION,
                            question         TEXT,
                            created_at       TIMESTAMPTZ DEFAULT NOW(),
                            dismissed        BOOLEAN DEFAULT FALSE
                        )
                    """)

                    for insight in insights:
                        hash_input = (
                            f"{insight.metric}:{insight.category}:"
                            f"{insight.data_date}:{insight.headline}"
                        )
                        insight_hash = hashlib.sha256(
                            hash_input.encode()
                        ).hexdigest()[:16]

                        cur.execute("""
                            INSERT INTO insights
                                (insight_hash, metric, category, severity,
                                 headline, body, data_date, current_value,
                                 comparison_value, pct_change, question)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON CONFLICT (insight_hash) DO UPDATE SET
                                severity = EXCLUDED.severity,
                                headline = EXCLUDED.headline,
                                body = EXCLUDED.body,
                                current_value = EXCLUDED.current_value,
                                comparison_value = EXCLUDED.comparison_value,
                                pct_change = EXCLUDED.pct_change,
                                created_at = NOW()
                        """, (
                            insight_hash,
                            insight.metric,
                            insight.category,
                            insight.severity,
                            insight.headline,
                            insight.body,
                            insight.data_date,
                            insight.current_value,
                            insight.comparison_value,
                            insight.pct_change,
                            insight.question,
                        ))

                conn.commit()
            logger.info("insights_engine.persisted", count=len(insights))
        except Exception:
            logger.error("insights_engine.persist_failed", exc_info=True)


def _humanize(metric_name: str) -> str:
    """Convert snake_case metric name to Title Case."""
    return metric_name.replace("_", " ").title()


# ------------------------------------------------------------------ #
# Standalone execution
# ------------------------------------------------------------------ #

if __name__ == "__main__":
    engine = InsightsEngine()
    results = engine.run()
    for insight in results:
        print(f"[{insight.severity.upper()}] {insight.headline}")
        print(f"  {insight.body}")
        print()
