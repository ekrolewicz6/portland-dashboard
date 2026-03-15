"""
Portland Commons Dashboard — ETL Scheduler

Orchestrates all ETL workers on their respective schedules:
  - Daily:     PPB crime, permits
  - Weekly:    Business licenses, Placer.ai traffic, TriMet
  - Monthly:   Zillow rents, BLS employment
  - Quarterly: HUD vacancy
  - Annual:    Census, IRS migration

Run modes:
  python scheduler.py                    # Start the continuous scheduler
  python scheduler.py --run-all          # Run every worker once (backfill)
  python scheduler.py --run ppb_crime    # Run a single worker by name
  python scheduler.py --run-tier daily   # Run all workers in a schedule tier
  python scheduler.py --list             # List all workers and schedules
"""

from __future__ import annotations

import argparse
import signal
import sys
import time
from datetime import datetime, timezone

import schedule
import structlog

from base_worker import BaseWorker
from workers import ALL_WORKERS

logger = structlog.get_logger()

# ------------------------------------------------------------------ #
# Build schedule-tier registry from worker class attributes
# ------------------------------------------------------------------ #

_SCHEDULE_TIERS: dict[str, list[type[BaseWorker]]] = {
    "daily": [],
    "weekly": [],
    "monthly": [],
    "quarterly": [],
    "annual": [],
}

for _worker_cls in ALL_WORKERS:
    tier = getattr(_worker_cls, "schedule", "weekly")
    _SCHEDULE_TIERS.setdefault(tier, []).append(_worker_cls)


# ------------------------------------------------------------------ #
# Execution helpers
# ------------------------------------------------------------------ #

def run_tier(tier: str) -> None:
    """Execute all workers in a schedule tier."""
    workers = _SCHEDULE_TIERS.get(tier, [])
    if not workers:
        logger.warning("scheduler.empty_tier", tier=tier)
        return

    logger.info("scheduler.tier_start", tier=tier, worker_count=len(workers))

    for worker_cls in workers:
        worker = worker_cls()
        try:
            summary = worker.run()
            logger.info(
                "scheduler.worker_complete",
                worker=worker.name,
                status=summary["status"],
                duration=summary.get("duration_seconds"),
                rows=summary.get("rows_transformed"),
            )
        except Exception:
            logger.error(
                "scheduler.worker_crashed",
                worker=worker.name,
                exc_info=True,
            )

    logger.info("scheduler.tier_complete", tier=tier)


def run_single(worker_name: str) -> None:
    """Run a single worker by name."""
    worker_cls = next(
        (w for w in ALL_WORKERS if w.name == worker_name),
        None,
    )
    if worker_cls is None:
        available = [w.name for w in ALL_WORKERS]
        logger.error(
            "scheduler.worker_not_found",
            name=worker_name,
            available=available,
        )
        sys.exit(1)

    worker = worker_cls()
    summary = worker.run()
    logger.info("scheduler.single_complete", **summary)


def run_all() -> None:
    """Run every worker once (useful for initial backfill)."""
    logger.info("scheduler.run_all_start", worker_count=len(ALL_WORKERS))
    for worker_cls in ALL_WORKERS:
        worker = worker_cls()
        try:
            summary = worker.run()
            logger.info(
                "scheduler.worker_complete",
                worker=worker.name,
                status=summary["status"],
            )
        except Exception:
            logger.error(
                "scheduler.worker_crashed",
                worker=worker.name,
                exc_info=True,
            )
    logger.info("scheduler.run_all_complete")


# ------------------------------------------------------------------ #
# Continuous scheduler
# ------------------------------------------------------------------ #

def start_scheduler() -> None:
    """Configure and start the continuous schedule loop."""
    logger.info("scheduler.configuring")

    # Daily workers — run at 2:00 AM Pacific (09:00 UTC)
    schedule.every().day.at("09:00").do(run_tier, "daily")

    # Weekly workers — Monday at 3:00 AM Pacific (10:00 UTC)
    schedule.every().monday.at("10:00").do(run_tier, "weekly")

    # Monthly workers — 1st of each month at 4:00 AM Pacific
    def _monthly_check():
        if datetime.now(timezone.utc).day == 1:
            run_tier("monthly")

    schedule.every().day.at("11:00").do(_monthly_check)

    # Quarterly workers — Jan 1, Apr 1, Jul 1, Oct 1
    def _quarterly_check():
        now = datetime.now(timezone.utc)
        if now.day == 1 and now.month in (1, 4, 7, 10):
            run_tier("quarterly")

    schedule.every().day.at("12:00").do(_quarterly_check)

    # Annual workers — January 15 (after New Year data releases settle)
    def _annual_check():
        now = datetime.now(timezone.utc)
        if now.month == 1 and now.day == 15:
            run_tier("annual")

    schedule.every().day.at("13:00").do(_annual_check)

    # Insights engine — run after daily workers complete
    def _run_insights():
        try:
            from insights_engine import InsightsEngine
            engine = InsightsEngine()
            engine.run()
        except Exception:
            logger.error("scheduler.insights_failed", exc_info=True)

    schedule.every().day.at("09:30").do(_run_insights)

    logger.info(
        "scheduler.started",
        jobs=len(schedule.get_jobs()),
        tiers={
            tier: [w.name for w in workers]
            for tier, workers in _SCHEDULE_TIERS.items()
        },
    )

    # Graceful shutdown
    def _shutdown(signum, frame):
        logger.info("scheduler.shutdown", signal=signum)
        schedule.clear()
        sys.exit(0)

    signal.signal(signal.SIGINT, _shutdown)
    signal.signal(signal.SIGTERM, _shutdown)

    # Main loop
    while True:
        schedule.run_pending()
        time.sleep(30)


# ------------------------------------------------------------------ #
# CLI entry point
# ------------------------------------------------------------------ #

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Portland Commons Dashboard ETL Scheduler",
    )
    parser.add_argument(
        "--run-all",
        action="store_true",
        help="Run every worker once (backfill mode)",
    )
    parser.add_argument(
        "--run",
        type=str,
        metavar="WORKER_NAME",
        help="Run a single worker by name",
    )
    parser.add_argument(
        "--run-tier",
        type=str,
        choices=list(_SCHEDULE_TIERS.keys()),
        help="Run all workers in a schedule tier",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all available workers and their schedules",
    )

    args = parser.parse_args()

    if args.list:
        print("Portland Commons ETL Workers:")
        print(f"  {'Name':<25s} {'Schedule':<12s} {'Staging Table'}")
        print(f"  {'-'*25} {'-'*12} {'-'*30}")
        for worker_cls in ALL_WORKERS:
            w = worker_cls()
            print(f"  {w.name:<25s} {w.schedule:<12s} {w.staging_table}")
        return

    if args.run_all:
        run_all()
    elif args.run:
        run_single(args.run)
    elif args.run_tier:
        run_tier(args.run_tier)
    else:
        start_scheduler()


if __name__ == "__main__":
    main()
