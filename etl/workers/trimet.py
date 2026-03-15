"""
TriMet GTFS Data Worker

Source: TriMet Developer API — GTFS static schedule + ridership
URL: https://developer.trimet.org/
Tier: A (Fully Automated) for schedule data, B for historical ridership
Schedule: Weekly (schedule), Quarterly (ridership from performance reports)

Downloads the GTFS static feed and extracts route/stop/trip metadata.
Historical ridership aggregates (monthly boardings by line) come from
TriMet's published performance reports — this worker handles the GTFS
schedule component. Ridership scraping is a TODO.
"""

from __future__ import annotations

import io
import zipfile
from typing import Any

import pandas as pd
import requests

from base_worker import BaseWorker, EtlError
from config.settings import settings

_GTFS_STATIC_URL = "http://developer.trimet.org/schedule/gtfs.zip"

# Real-time endpoints (for future use)
_GTFS_RT_TRIP_UPDATES = "http://developer.trimet.org/ws/V1/TripUpdate"
_GTFS_RT_VEHICLE_POSITIONS = "http://developer.trimet.org/ws/V1/VehiclePositions"
_GTFS_RT_ALERTS = "http://developer.trimet.org/ws/V1/FeedSpecAlerts"

_TIMEOUT = 120


class TrimetWorker(BaseWorker):
    name = "trimet"
    staging_table = "staging.trimet_gtfs"
    production_table = "public.trimet_gtfs"
    schedule = "weekly"

    def fetch(self) -> bytes:
        """Download the GTFS static feed ZIP."""
        app_id = settings.api_keys.trimet_app_id
        if not app_id:
            raise EtlError("TRIMET_APP_ID not configured")

        resp = requests.get(
            _GTFS_STATIC_URL,
            params={"appID": app_id},
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()

        if len(resp.content) < 10_000:
            raise EtlError(
                f"GTFS ZIP too small ({len(resp.content)} bytes), "
                "may be an error response"
            )

        return resp.content

    def validate(self, raw: bytes) -> None:
        """Verify the ZIP contains expected GTFS files."""
        try:
            with zipfile.ZipFile(io.BytesIO(raw)) as zf:
                names = set(zf.namelist())
        except zipfile.BadZipFile as exc:
            raise EtlError(f"Invalid GTFS ZIP file: {exc}") from exc

        required = {"routes.txt", "stops.txt", "trips.txt", "stop_times.txt"}
        missing = required - names
        if missing:
            raise EtlError(f"GTFS ZIP missing required files: {missing}")

    def transform(self, raw: bytes) -> pd.DataFrame:
        """Extract routes, stops, and trip counts from the GTFS feed.

        Produces a summary table of routes with stop counts and trip counts
        per service day, suitable for dashboard display and ridership
        context.
        """
        with zipfile.ZipFile(io.BytesIO(raw)) as zf:
            routes_df = pd.read_csv(zf.open("routes.txt"), dtype=str)
            trips_df = pd.read_csv(zf.open("trips.txt"), dtype=str)
            stops_df = pd.read_csv(zf.open("stops.txt"), dtype=str)
            stop_times_df = pd.read_csv(zf.open("stop_times.txt"), dtype=str)

        # Normalize column names
        for df in (routes_df, trips_df, stops_df, stop_times_df):
            df.columns = [c.strip().lower() for c in df.columns]

        # Count trips per route
        trips_per_route = (
            trips_df.groupby("route_id")
            .size()
            .reset_index(name="trip_count")
        )

        # Count unique stops per route (via stop_times + trips)
        if "trip_id" in stop_times_df.columns:
            route_stops = (
                stop_times_df.merge(trips_df[["trip_id", "route_id"]], on="trip_id")
                .groupby("route_id")["stop_id"]
                .nunique()
                .reset_index(name="unique_stop_count")
            )
        else:
            route_stops = pd.DataFrame(columns=["route_id", "unique_stop_count"])

        # Build route summary
        route_summary = routes_df.merge(trips_per_route, on="route_id", how="left")
        route_summary = route_summary.merge(route_stops, on="route_id", how="left")

        # Keep useful columns
        keep_cols = [
            c for c in route_summary.columns
            if c in {
                "route_id", "route_short_name", "route_long_name",
                "route_type", "route_color", "trip_count", "unique_stop_count",
            }
        ]
        route_summary = route_summary[keep_cols]

        # Map route_type to human-readable
        route_type_map = {
            "0": "streetcar",
            "1": "light_rail",
            "2": "commuter_rail",
            "3": "bus",
            "4": "ferry",
        }
        if "route_type" in route_summary.columns:
            route_summary["route_type_name"] = (
                route_summary["route_type"].map(route_type_map).fillna("other")
            )

        # TODO: Add ridership data scraping from TriMet performance reports
        # https://trimet.org/about/performance.htm
        # This would provide monthly boardings by line to compare against
        # 2019 baseline for the "Is downtown coming back to life?" question.

        return route_summary
