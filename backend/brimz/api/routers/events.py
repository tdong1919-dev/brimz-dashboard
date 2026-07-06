"""Events + the live/crowd data hung off each event."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from brimz.api.deps import controller, get_db, get_event_or_404
from brimz.api.playback.state import (
    clock_for_event,
    now_utc,
    playback_state,
    stadium_state,
)
from brimz.api.schemas.core import (
    EmotionOut,
    EmotionsOut,
    EngagementPointOut,
    EventOut,
    KpiOut,
    MomentOut,
    TimelinePointOut,
    ZoneEngagementOut,
)
from brimz.api.schemas.extended import AlertOut, RevenueLineOut, TransactionOut
from brimz.api.schemas.live import PlaybackStateOut, StadiumStateOut
from brimz.api.services import energy as energy_svc
from brimz.api.services import kpis as kpis_svc
from brimz.db.models.core import Event, Zone
from brimz.db.models.extended import Alert, Emotion, RevenueLine, TopMoment, Transaction
from brimz.db.models.wearable import EngagementEvent, ZoneEngagement

from brimz.api.security import get_current_user

router = APIRouter(prefix="/api/v1", tags=["events"], dependencies=[Depends(get_current_user)])


@router.get("/events", response_model=list[EventOut])
def list_events(db: Session = Depends(get_db)):
    return db.execute(select(Event).order_by(Event.id)).scalars().all()


@router.get("/events/{event_id}", response_model=EventOut)
def get_event(event: Event = Depends(get_event_or_404)):
    return event


@router.get("/events/{event_id}/energy", response_model=list[TimelinePointOut])
def get_energy(
    event: Event = Depends(get_event_or_404),
    db: Session = Depends(get_db),
    until: datetime | None = Query(None, description="Truncate the timeline at this event-time"),
):
    return energy_svc.energy_timeline(db, event.id, until=until)


@router.get("/events/{event_id}/state", response_model=StadiumStateOut)
def get_state(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    """Live stadium snapshot at the current playhead (per-zone energy that moves)."""
    clock = clock_for_event(db, controller, event.id)
    if clock is None:
        raise HTTPException(status_code=404, detail="no energy data for this event")
    playhead = clock.playhead(now_utc())
    return stadium_state(db, event.id, playhead)


@router.get("/events/{event_id}/playback", response_model=PlaybackStateOut)
def get_event_playback(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    clock = clock_for_event(db, controller, event.id)
    if clock is None:
        raise HTTPException(status_code=404, detail="no energy data for this event")
    return playback_state(clock, event.id, now_utc())


@router.get("/events/{event_id}/zones", response_model=list[ZoneEngagementOut])
def get_zones(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    rows = db.execute(
        select(ZoneEngagement, Zone)
        .join(Zone, Zone.id == ZoneEngagement.zone_id)
        .where(ZoneEngagement.event_id == event.id)
        .order_by(ZoneEngagement.score.desc())
    ).all()
    return [
        ZoneEngagementOut(
            zone_id=ze.zone_id, zone=z.name, score=ze.score, vs_avg=ze.vs_avg,
            filled_pct=ze.filled_pct, capacity=z.capacity,
        )
        for ze, z in rows
    ]


@router.get("/events/{event_id}/kpis", response_model=list[KpiOut])
def get_kpis(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    return kpis_svc.event_kpis(db, event.id)


@router.get("/events/{event_id}/moments", response_model=list[MomentOut])
def get_moments(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    return db.execute(
        select(TopMoment).where(TopMoment.event_id == event.id).order_by(TopMoment.rank)
    ).scalars().all()


@router.get("/events/{event_id}/emotions", response_model=EmotionsOut)
def get_emotions(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    rows = db.execute(select(Emotion).where(Emotion.event_id == event.id)).scalars().all()
    return EmotionsOut(
        emotions=[EmotionOut(label=e.label, pct=e.pct) for e in rows if e.kind == "emotion"],
        drivers=[EmotionOut(label=e.label, pct=e.pct) for e in rows if e.kind == "driver"],
    )


@router.get("/events/{event_id}/engagement", response_model=list[EngagementPointOut])
def get_engagement(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    rows = db.execute(
        select(EngagementEvent).where(EngagementEvent.event_id == event.id).order_by(EngagementEvent.ts)
    ).scalars().all()
    return [EngagementPointOut(ts=r.ts, type=r.type, count=r.count) for r in rows]


@router.get("/events/{event_id}/revenue", response_model=list[RevenueLineOut])
def get_revenue(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    return db.execute(
        select(RevenueLine).where(RevenueLine.event_id == event.id)
    ).scalars().all()


@router.get("/events/{event_id}/transactions", response_model=list[TransactionOut])
def get_transactions(
    event: Event = Depends(get_event_or_404),
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    return db.execute(
        select(Transaction).where(Transaction.event_id == event.id)
        .order_by(Transaction.ts).limit(limit).offset(offset)
    ).scalars().all()


@router.get("/events/{event_id}/alerts", response_model=list[AlertOut])
def get_alerts(event: Event = Depends(get_event_or_404), db: Session = Depends(get_db)):
    return db.execute(
        select(Alert).where(Alert.event_id == event.id).order_by(Alert.created_at.desc())
    ).scalars().all()
