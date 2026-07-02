"""Helpers to assemble the live playback + stadium state, shared by REST and WS.

Kept out of the routers so the WebSocket feed and the `GET /state` / `GET /playback`
endpoints produce byte-identical payloads (single source of truth).
"""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from brimz.api.playback import PlaybackController
from brimz.api.playback.clock import PlaybackClock
from brimz.api.schemas.live import (
    MomentStateOut,
    PlaybackStateOut,
    StadiumStateOut,
    TickOut,
    ZoneStateOut,
)
from brimz.api.services import energy as energy_svc


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def clock_for_event(
    session: Session, controller: PlaybackController, event_id: int
) -> PlaybackClock | None:
    window = energy_svc.event_window(session, event_id)
    if window is None:
        return None
    return controller.clock_for(window[0], window[1])


def playback_state(clock: PlaybackClock, event_id: int, now: datetime) -> PlaybackStateOut:
    return PlaybackStateOut(
        mode=clock.mode,
        loop_seconds=clock.loop_seconds,
        speed=clock.speed,
        window_start=clock.window_start,
        window_end=clock.window_end,
        playhead=clock.playhead(now),
        loop_fraction=clock.loop_fraction(now),
        event_id=event_id,
    )


def stadium_state(session: Session, event_id: int, playhead: datetime) -> StadiumStateOut:
    st = energy_svc.state_at(session, event_id, playhead)
    return StadiumStateOut(
        event_id=st.event_id,
        playhead=st.playhead,
        total_energy=st.total_energy,
        zones=[ZoneStateOut(**vars(z)) for z in st.zones],
        active_moments=[MomentStateOut(**m) for m in st.active_moments],
    )


def build_tick(
    session: Session, controller: PlaybackController, event_id: int, now: datetime
) -> TickOut | None:
    clock = clock_for_event(session, controller, event_id)
    if clock is None:
        return None
    pb = playback_state(clock, event_id, now)
    state = stadium_state(session, event_id, pb.playhead)
    return TickOut(playback=pb, state=state)
