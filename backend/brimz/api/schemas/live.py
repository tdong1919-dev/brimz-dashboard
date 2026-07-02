"""Response schemas for the live playback surface (REST /state + WebSocket ticks)."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class ZoneStateOut(BaseModel):
    zone_id: int
    name: str
    energy: int
    score: int | None = None
    vs_avg: int | None = None
    filled_pct: int | None = None
    capacity: int | None = None
    hot: bool


class MomentStateOut(BaseModel):
    rank: int
    label: str
    occurred_at: datetime | None = None
    energy: int | None = None


class StadiumStateOut(BaseModel):
    """Live snapshot of the whole stadium at the current playhead."""

    event_id: int
    playhead: datetime
    total_energy: int
    zones: list[ZoneStateOut]
    active_moments: list[MomentStateOut]


class PlaybackStateOut(BaseModel):
    mode: str
    loop_seconds: float
    speed: float
    window_start: datetime
    window_end: datetime
    playhead: datetime
    loop_fraction: float
    event_id: int


class PlaybackControlIn(BaseModel):
    """Body for POST /playback. All fields optional; only provided ones apply."""

    mode: str | None = None            # live | paused | seek
    seek: datetime | None = None       # event-time to jump to (for seek/pause)
    loop_seconds: float | None = None  # change replay speed


class TickOut(BaseModel):
    """One WebSocket frame: the full stadium state plus playback position."""

    type: str = "tick"
    playback: PlaybackStateOut
    state: StadiumStateOut
