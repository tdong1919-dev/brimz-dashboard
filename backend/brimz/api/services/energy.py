"""Energy + per-zone state services — the data behind the live playback.

Two sample families live in ``energy_samples`` for an event:
  * venue-wide rows (``zone_id IS NULL``) carry the headline energy timeline and
    labelled moments ("Doors Open", "PEAK", ...);
  * per-zone rows (``zone_id`` set) carry each section's own curve, so sections
    light up independently.

``state_at`` interpolates both at a given playhead to produce the live stadium
snapshot the dashboard renders.
"""
from __future__ import annotations

from bisect import bisect_left
from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from brimz.db.models.core import Event, Zone
from brimz.db.models.extended import TopMoment
from brimz.db.models.wearable import EnergySample, ZoneEngagement


@dataclass
class TimelinePoint:
    ts: datetime
    label: str | None
    energy_value: int


@dataclass
class ZoneState:
    zone_id: int
    name: str
    energy: int
    score: int | None
    vs_avg: int | None
    filled_pct: int | None
    capacity: int | None
    hot: bool


@dataclass
class StadiumState:
    event_id: int
    playhead: datetime
    total_energy: int
    zones: list[ZoneState]
    active_moments: list[dict]


def event_window(session: Session, event_id: int) -> tuple[datetime, datetime] | None:
    """[min ts, max ts] across all energy samples for the event, or None if unseeded."""
    row = session.execute(
        select(EnergySample.ts).where(EnergySample.event_id == event_id).order_by(EnergySample.ts)
    ).scalars().all()
    if not row:
        return None
    return row[0], row[-1]


def energy_timeline(session: Session, event_id: int, *, until: datetime | None = None) -> list[TimelinePoint]:
    """Venue-wide (zone_id IS NULL) energy timeline, optionally truncated at ``until``."""
    stmt = (
        select(EnergySample)
        .where(EnergySample.event_id == event_id, EnergySample.zone_id.is_(None))
        .order_by(EnergySample.ts)
    )
    if until is not None:
        stmt = stmt.where(EnergySample.ts <= until)
    return [
        TimelinePoint(ts=s.ts, label=s.label, energy_value=s.energy_value)
        for s in session.execute(stmt).scalars()
    ]


def _series(session: Session, event_id: int, zone_id: int | None) -> list[tuple[datetime, int]]:
    stmt = select(EnergySample.ts, EnergySample.energy_value).where(
        EnergySample.event_id == event_id
    )
    stmt = stmt.where(EnergySample.zone_id.is_(None) if zone_id is None else EnergySample.zone_id == zone_id)
    return [(ts, val) for ts, val in session.execute(stmt.order_by(EnergySample.ts))]


def interpolate(series: list[tuple[datetime, int]], at: datetime) -> int:
    """Linear-interpolate a timestamped series at ``at`` (clamped to the ends).

    Smooths the live feed between the discrete seeded samples so sections glide
    rather than jump each tick.
    """
    if not series:
        return 0
    times = [t for t, _ in series]
    if at <= times[0]:
        return series[0][1]
    if at >= times[-1]:
        return series[-1][1]
    i = bisect_left(times, at)
    if times[i] == at:
        return series[i][1]
    t0, v0 = series[i - 1]
    t1, v1 = series[i]
    span = (t1 - t0).total_seconds()
    if span <= 0:
        return v0
    frac = (at - t0).total_seconds() / span
    return round(v0 + (v1 - v0) * frac)


def state_at(session: Session, event_id: int, playhead: datetime) -> StadiumState:
    """The live stadium snapshot at ``playhead``: total energy + per-zone energy.

    Per-zone energy is interpolated from each zone's own series; ``hot`` flags the
    top third of zones by current energy so the dashboard can highlight the
    sections that are peaking right now.
    """
    total = interpolate(_series(session, event_id, None), playhead)

    engagement = {
        ze.zone_id: ze
        for ze in session.execute(
            select(ZoneEngagement).where(ZoneEngagement.event_id == event_id)
        ).scalars()
    }
    zones = {z.id: z for z in session.execute(select(Zone)).scalars()}

    zone_ids = [
        zid for (zid,) in session.execute(
            select(EnergySample.zone_id)
            .where(EnergySample.event_id == event_id, EnergySample.zone_id.is_not(None))
            .distinct()
        )
    ]

    zone_states: list[ZoneState] = []
    for zid in zone_ids:
        energy = interpolate(_series(session, event_id, zid), playhead)
        ze = engagement.get(zid)
        z = zones.get(zid)
        zone_states.append(
            ZoneState(
                zone_id=zid,
                name=z.name if z else f"Zone {zid}",
                energy=energy,
                score=ze.score if ze else None,
                vs_avg=ze.vs_avg if ze else None,
                filled_pct=ze.filled_pct if ze else None,
                capacity=z.capacity if z else None,
                hot=False,
            )
        )

    # Mark the top third of zones (by current energy) as hot.
    if zone_states:
        ranked = sorted(zone_states, key=lambda s: s.energy, reverse=True)
        cutoff = max(1, len(ranked) // 3)
        for s in ranked[:cutoff]:
            s.hot = True

    moments = [
        {"rank": m.rank, "label": m.label, "occurred_at": m.occurred_at, "energy": m.energy}
        for m in session.execute(
            select(TopMoment).where(TopMoment.event_id == event_id).order_by(TopMoment.rank)
        ).scalars()
        if m.occurred_at is None or m.occurred_at <= playhead
    ]

    return StadiumState(
        event_id=event_id,
        playhead=playhead,
        total_energy=total,
        zones=zone_states,
        active_moments=moments,
    )
