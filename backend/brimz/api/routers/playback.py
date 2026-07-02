"""Demo playback control — inspect and drive the shared PlaybackController.

No auth in M2 by design; M3 gates this behind admin login. See `# M3-auth`.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from brimz.api.deps import controller, get_db
from brimz.api.playback.clock import LIVE, PAUSED, SEEK
from brimz.api.playback.state import clock_for_event, now_utc, playback_state
from brimz.api.schemas.live import PlaybackControlIn, PlaybackStateOut
from brimz.config import settings

router = APIRouter(prefix="/api/v1", tags=["playback"])

_VALID_MODES = {LIVE, PAUSED, SEEK}


def _state_for(db: Session, event_id: int) -> PlaybackStateOut:
    clock = clock_for_event(db, controller, event_id)
    if clock is None:
        raise HTTPException(status_code=404, detail=f"no energy data for event {event_id}")
    return playback_state(clock, event_id, now_utc())


@router.get("/playback", response_model=PlaybackStateOut)
def get_playback(
    db: Session = Depends(get_db),
    event_id: int = Query(None, description="Event whose window to report against"),
):
    return _state_for(db, event_id or settings.playback_default_event_id)


@router.post("/playback", response_model=PlaybackStateOut)
def control_playback(
    body: PlaybackControlIn,
    db: Session = Depends(get_db),
    event_id: int = Query(None),
):
    # M3-auth: restrict to admin once auth lands.
    if body.loop_seconds is not None:
        try:
            controller.set_speed(body.loop_seconds)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc))

    if body.mode is not None:
        if body.mode not in _VALID_MODES:
            raise HTTPException(status_code=422, detail=f"invalid mode: {body.mode}")
        if body.mode == LIVE:
            controller.play()
        elif body.mode == PAUSED:
            controller.pause(body.seek)
        elif body.mode == SEEK:
            if body.seek is None:
                raise HTTPException(status_code=422, detail="seek mode requires a 'seek' event-time")
            controller.seek(body.seek)
    elif body.seek is not None:
        # Seek time given without an explicit mode → treat as a seek.
        controller.seek(body.seek)

    return _state_for(db, event_id or settings.playback_default_event_id)
