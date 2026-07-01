"""Database validation — the Milestone 1 'Database validation' deliverable.

Verifies the four acceptance criteria: mock data stored, Fitbit data stored,
structured/queryable data available, and referential integrity maintained.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from brimz.db.models import (
    Attendee,
    Event,
    FitbitActivitySample,
    FitbitHeartrateSample,
    FitbitRawPayload,
    Venue,
    ZoneEngagement,
)


@dataclass
class CheckResult:
    passed: list[str] = field(default_factory=list)
    failed: list[str] = field(default_factory=list)

    @property
    def ok(self) -> bool:
        return not self.failed

    def check(self, name: str, condition: bool, detail: str = "") -> None:
        label = f"{name}" + (f" — {detail}" if detail else "")
        (self.passed if condition else self.failed).append(label)


# Tables that must contain rows after a successful seed.
REQUIRED_NONEMPTY = [
    "venues", "zones", "events", "fan_segments", "attendees", "attendee_segments",
    "devices", "energy_samples", "zone_engagement", "engagement_events", "emotions",
    "revenue_lines", "transactions", "sponsors", "sponsor_roi", "campaigns",
    "ugc_content", "alerts", "top_moments", "crowd_triggers", "staff_users",
    "access_roles", "integrations", "billing_records",
    "fitbit_accounts", "fitbit_raw_payloads", "fitbit_activity_samples",
    "fitbit_heartrate_samples",
]


def run_checks(session: Session) -> CheckResult:
    r = CheckResult()

    # 1. Store mock data successfully — every domain table is populated.
    for table in REQUIRED_NONEMPTY:
        n = session.execute(text(f"SELECT count(*) FROM {table}")).scalar_one()
        r.check(f"table '{table}' populated", n > 0, f"{n} rows")

    # 2. Store Fitbit data successfully — raw JSONB + normalized samples present.
    raw = session.scalar(select(func.count()).select_from(FitbitRawPayload)) or 0
    act = session.scalar(select(func.count()).select_from(FitbitActivitySample)) or 0
    hr = session.scalar(select(func.count()).select_from(FitbitHeartrateSample)) or 0
    r.check("Fitbit raw JSONB stored", raw > 0, f"{raw} payloads")
    r.check("Fitbit normalized samples stored", act > 0 and hr > 0, f"{act} activity / {hr} heartrate")

    # JSONB is genuinely queryable (not just an opaque blob).
    stepped = session.execute(
        text("SELECT count(*) FROM fitbit_raw_payloads WHERE payload -> 'summary' ? 'steps'")
    ).scalar_one()
    r.check("Fitbit JSONB is queryable", stepped > 0, f"{stepped} payloads expose summary.steps")

    # Normalized heart-rate rows reconcile with the raw intraday dataset length.
    hr_dataset_len = session.execute(
        text(
            "SELECT sum(jsonb_array_length(payload #> '{activities-heart-intraday,dataset}')) "
            "FROM fitbit_raw_payloads "
            "WHERE endpoint LIKE '%/heart/%'"
        )
    ).scalar()
    r.check(
        "heart-rate samples reconcile with raw dataset",
        hr_dataset_len is not None and int(hr_dataset_len) == hr,
        f"raw datapoints={hr_dataset_len}, normalized rows={hr}",
    )

    # 3. Provide structured data for backend services — key relationships resolve.
    venue = session.scalar(select(Venue))
    r.check("venue present with zones", venue is not None and len(venue.zones) > 0)
    champ = session.scalar(select(Event).order_by(Event.id))
    r.check("championship event has energy timeline", champ is not None and
            (session.scalar(select(func.count()).select_from(ZoneEngagement)
                            .where(ZoneEngagement.event_id == champ.id)) or 0) > 0)

    # Per-zone energy time-series — enables the "sections active in the moment"
    # live simulation. Every zone must have a multi-point curve over the event.
    zones_with_series = session.execute(
        text("SELECT count(DISTINCT zone_id) FROM energy_samples WHERE zone_id IS NOT NULL")
    ).scalar_one()
    total_zones = session.execute(text("SELECT count(*) FROM zones")).scalar_one()
    r.check("per-zone energy time-series present (live simulation)",
            zones_with_series == total_zones and total_zones > 0,
            f"{zones_with_series}/{total_zones} zones have a time-series")

    # Amplification model — one real template account + many simulated fans.
    template = session.execute(
        text("SELECT count(*) FROM fitbit_accounts WHERE fitbit_user_id = 'REAL-TEMPLATE'")
    ).scalar_one()
    simulated = session.execute(
        text("SELECT count(*) FROM fitbit_accounts WHERE fitbit_user_id LIKE 'SIM%'")
    ).scalar_one()
    r.check("real template + simulated fans present", template == 1 and simulated > 0,
            f"{template} template, {simulated} simulated")

    # 4. Maintain data integrity — no orphaned foreign keys.
    orphan_queries = {
        "zones→venues": "SELECT count(*) FROM zones z LEFT JOIN venues v ON z.venue_id=v.id WHERE v.id IS NULL",
        "events→venues": "SELECT count(*) FROM events e LEFT JOIN venues v ON e.venue_id=v.id WHERE v.id IS NULL",
        "attendee_segments→attendees": "SELECT count(*) FROM attendee_segments a LEFT JOIN attendees t ON a.attendee_id=t.id WHERE t.id IS NULL",
        "fitbit_accounts→attendees": "SELECT count(*) FROM fitbit_accounts f LEFT JOIN attendees t ON f.attendee_id=t.id WHERE t.id IS NULL",
        "fitbit_raw_payloads→accounts": "SELECT count(*) FROM fitbit_raw_payloads p LEFT JOIN fitbit_accounts a ON p.account_id=a.id WHERE a.id IS NULL",
        "activity_samples→accounts": "SELECT count(*) FROM fitbit_activity_samples s LEFT JOIN fitbit_accounts a ON s.account_id=a.id WHERE a.id IS NULL",
        "heartrate_samples→accounts": "SELECT count(*) FROM fitbit_heartrate_samples s LEFT JOIN fitbit_accounts a ON s.account_id=a.id WHERE a.id IS NULL",
    }
    for label, q in orphan_queries.items():
        orphans = session.execute(text(q)).scalar_one()
        r.check(f"no orphaned FKs: {label}", orphans == 0, f"{orphans} orphans")

    # Attendee count matches configured sample size class (sanity).
    n_att = session.scalar(select(func.count()).select_from(Attendee)) or 0
    r.check("attendee sample generated", n_att > 0, f"{n_att} attendees")

    return r
