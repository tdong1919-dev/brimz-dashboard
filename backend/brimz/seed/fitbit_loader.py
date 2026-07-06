"""Ingest Fitbit JSON payloads: store raw JSONB, then parse into normalized samples.

The transform functions here are deliberately pure so Milestones 2 and 4 can reuse
them against live Fitbit API responses instead of fixtures.
"""
from __future__ import annotations

import json
from datetime import date, datetime, time, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from brimz.db.models import (
    Event,
    FitbitAccount,
    FitbitActivitySample,
    FitbitHeartrateSample,
    FitbitRawPayload,
)

FIXTURES_DIR = Path(__file__).parent / "fitbit_fixtures"


def hr_zone_for(bpm: int, zones: list[dict]) -> str | None:
    """Map a bpm reading to its Fitbit heart-rate zone name."""
    for zone in zones:
        if zone.get("min", 0) <= bpm < zone.get("max", 10**9):
            return zone.get("name")
    return zones[-1].get("name") if zones else None


def store_raw_payload(
    session: Session,
    account: FitbitAccount,
    endpoint: str,
    payload: dict,
    fetched_at: datetime,
) -> FitbitRawPayload:
    """Persist a raw Fitbit response verbatim as JSONB."""
    row = FitbitRawPayload(
        account=account, endpoint=endpoint, payload=payload, fetched_at=fetched_at
    )
    session.add(row)
    session.flush()  # assign id for source_payload_id links
    return row


def parse_activity(payload: dict, day: date) -> dict:
    """Extract a normalized activity sample from an activity-summary payload."""
    summary = payload.get("summary", {})
    return {
        "ts": datetime.combine(day, time(23, 59), tzinfo=timezone.utc),
        "steps": int(summary.get("steps", 0)),
        "calories": int(summary.get("caloriesOut", 0)),
        "active_minutes": int(
            summary.get("veryActiveMinutes", 0) + summary.get("fairlyActiveMinutes", 0)
        ),
    }


def parse_heartrate(payload: dict, day: date) -> list[dict]:
    """Extract normalized heart-rate samples from an intraday heart-rate payload."""
    heart = payload.get("activities-heart", [])
    zones = heart[0]["value"]["heartRateZones"] if heart else []
    dataset = payload.get("activities-heart-intraday", {}).get("dataset", [])
    samples: list[dict] = []
    for point in dataset:
        hh, mm, ss = (int(x) for x in point["time"].split(":"))
        bpm = int(point["value"])
        samples.append(
            {
                "ts": datetime.combine(day, time(hh, mm, ss), tzinfo=timezone.utc),
                "bpm": bpm,
                "hr_zone": hr_zone_for(bpm, zones),
            }
        )
    return samples


def ingest_account_day(
    session: Session,
    account: FitbitAccount,
    event: Event,
    day: date,
    fetched_at: datetime,
    fixtures_dir: Path = FIXTURES_DIR,
    *,
    hr_scale: float = 1.0,
    hr_jitter: int = 0,
    rng=None,
) -> tuple[int, int]:
    """Load activity + heart-rate fixtures for one account/day: raw JSONB → normalized rows.

    The raw JSONB stored below is the real template payload, verbatim. The
    optional per-account variation (`hr_scale`, `hr_jitter`) only perturbs the
    *normalized* samples — this is how one real Fitbit template is amplified into
    many distinct simulated fans for the full-stadium demo. In M4 the source
    payloads become live per-user Fitbit responses and variation is dropped.

    Returns (activity_rows, heartrate_rows).

    # TEMP (demo): reads fixture files. M4 replaces this source with a live
    # Fitbit API client that produces the same payload dicts.
    """
    activity_payload = json.loads((fixtures_dir / f"activity_{day.isoformat()}.json").read_text())
    heartrate_payload = json.loads((fixtures_dir / f"heartrate_{day.isoformat()}.json").read_text())

    activity_raw = store_raw_payload(
        session, account, f"/1/user/-/activities/date/{day.isoformat()}.json",
        activity_payload, fetched_at,
    )
    heartrate_raw = store_raw_payload(
        session, account,
        f"/1/user/-/activities/heart/date/{day.isoformat()}/1d/1min.json",
        heartrate_payload, fetched_at,
    )

    act = parse_activity(activity_payload, day)
    if hr_scale != 1.0:
        act["steps"] = int(act["steps"] * hr_scale)
        act["calories"] = int(act["calories"] * hr_scale)
    session.add(
        FitbitActivitySample(
            account_id=account.id, event_id=event.id, source_payload_id=activity_raw.id, **act
        )
    )

    hr_rows = parse_heartrate(heartrate_payload, day)
    for hr in hr_rows:
        bpm = hr["bpm"]
        if hr_scale != 1.0 or hr_jitter:
            j = rng.randint(-hr_jitter, hr_jitter) if (rng and hr_jitter) else 0
            bpm = max(40, min(210, int(bpm * hr_scale) + j))
        session.add(
            FitbitHeartrateSample(
                account_id=account.id, event_id=event.id, source_payload_id=heartrate_raw.id,
                ts=hr["ts"], bpm=bpm, hr_zone=hr["hr_zone"],
            )
        )

    return 1, len(hr_rows)
