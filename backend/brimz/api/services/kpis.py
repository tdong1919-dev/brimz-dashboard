"""Headline KPI rollups for an event — the Overview cards.

Derived from the seeded tables so the numbers stay consistent with the rest of
the API (rather than hard-coded like the dashboard's mock file).
"""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from brimz.db.models.core import Event
from brimz.db.models.extended import RevenueLine, SponsorROI
from brimz.db.models.wearable import EnergySample, ZoneEngagement


def _human(n: float) -> str:
    n = float(n)
    if abs(n) >= 1_000_000:
        return f"{n / 1_000_000:.1f}M"
    if abs(n) >= 1_000:
        return f"{n / 1_000:.0f}K"
    return f"{n:.0f}"


def event_kpis(session: Session, event_id: int) -> list[dict]:
    event = session.get(Event, event_id)
    if event is None:
        return []

    avg_engagement = session.execute(
        select(func.avg(ZoneEngagement.score)).where(ZoneEngagement.event_id == event_id)
    ).scalar()

    peak_energy = session.execute(
        select(func.max(EnergySample.energy_value)).where(
            EnergySample.event_id == event_id, EnergySample.zone_id.is_(None)
        )
    ).scalar()

    total_energy = session.execute(
        select(func.sum(EnergySample.energy_value)).where(
            EnergySample.event_id == event_id, EnergySample.zone_id.is_(None)
        )
    ).scalar()

    revenue = session.execute(
        select(func.sum(RevenueLine.amount)).where(RevenueLine.event_id == event_id)
    ).scalar()

    sponsorship = session.execute(
        select(func.sum(RevenueLine.amount)).where(
            RevenueLine.event_id == event_id, RevenueLine.category == "Sponsorship"
        )
    ).scalar()

    kpis = [
        {"label": "Total Attendance", "value": f"{event.attendance:,}", "suffix": None,
         "sub": "for this event"},
        {"label": "Avg Engagement Score", "value": f"{round(avg_engagement or 0)}",
         "suffix": "/100", "sub": "across zones"},
        {"label": "Peak Energy", "value": _human(peak_energy or 0), "suffix": None,
         "sub": "highest moment"},
        {"label": "Total Energy Generated", "value": _human(total_energy or 0), "suffix": None,
         "sub": "cumulative"},
        {"label": "Revenue (Gross)", "value": "$" + _human(revenue or 0), "suffix": None,
         "sub": "this event"},
        {"label": "Sponsorship Revenue", "value": "$" + _human(sponsorship or 0), "suffix": None,
         "sub": "this event"},
    ]
    return kpis
