"""The playback clock — the piece that makes seeded, historical data feel *live*.

An event's energy data is timestamped across its real window (e.g. 18:00–23:00).
Served statically that's a dead historical curve. `PlaybackClock` maps real
wall-clock time onto a position inside that window and **loops**, so the dashboard
shows the stadium "in the moment," continuously.

    window        = [window_start, window_end]         (event time)
    window_len    = window_end - window_start
    elapsed       = (now - anchor) * speed             (wall-clock since anchor)
    playhead      = window_start + (elapsed mod window_len)   -> loops forever

`speed` is derived so one full loop takes `loop_seconds` of wall-clock time,
compressing a multi-hour event into a demo-friendly cycle.

The clock is **pure**: `playhead(now)` is a deterministic function of its fields
and the `now` passed in — it never reads the wall clock itself. The only stateful
piece is `PlaybackController`, a process-local holder of the current mode/seek so
the demo can pause and jump (e.g. "show me the 20:24 peak"). Playback never writes
to the database.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

# Playback modes.
LIVE = "live"        # playhead follows wall-clock, looping (default demo mode)
PAUSED = "paused"    # frozen at seek_event_time (or window_start)
SEEK = "seek"        # pinned to a specific event-time (e.g. the peak)

_MODES = {LIVE, PAUSED, SEEK}


@dataclass(frozen=True)
class PlaybackClock:
    """Pure mapping of wall-clock → event-clock for one event window."""

    window_start: datetime
    window_end: datetime
    anchor: datetime            # fixed wall-clock reference; elapsed is measured from here
    loop_seconds: float         # wall-clock seconds for one full loop of the window
    mode: str = LIVE
    seek_event_time: datetime | None = None  # event-time to hold when paused/seeking

    def __post_init__(self) -> None:
        if self.mode not in _MODES:
            raise ValueError(f"unknown playback mode: {self.mode!r}")
        if self.window_end <= self.window_start:
            raise ValueError("window_end must be after window_start")
        if self.loop_seconds <= 0:
            raise ValueError("loop_seconds must be positive")

    @property
    def window_len_seconds(self) -> float:
        return (self.window_end - self.window_start).total_seconds()

    @property
    def speed(self) -> float:
        """Event-seconds advanced per wall-clock second (window_len / loop_seconds)."""
        return self.window_len_seconds / self.loop_seconds

    def _clamp(self, t: datetime) -> datetime:
        if t < self.window_start:
            return self.window_start
        if t > self.window_end:
            return self.window_end
        return t

    def playhead(self, now: datetime) -> datetime:
        """Event-time to display at wall-clock ``now``.

        In LIVE mode this loops through the window; in PAUSED/SEEK it holds the
        seek point (defaulting to window_start if none set).
        """
        now = _ensure_aware(now)
        if self.mode in (PAUSED, SEEK):
            return self._clamp(self.seek_event_time or self.window_start)

        elapsed = (now - self.anchor).total_seconds() * self.speed
        # Modulo into [0, window_len) so it loops; handle negative elapsed too.
        offset = elapsed % self.window_len_seconds
        return self.window_start + timedelta(seconds=offset)

    def loop_fraction(self, now: datetime) -> float:
        """Position through the window as a 0..1 fraction (useful for progress bars)."""
        head = self.playhead(now)
        return (head - self.window_start).total_seconds() / self.window_len_seconds


class PlaybackController:
    """Process-local, mutable playback state that produces immutable clocks.

    Holds the demo controls (mode / seek / loop speed) and an ``anchor`` fixed at
    construction so the loop is stable across requests. ``clock_for(window)`` stamps
    a given event window with the current controls to yield a pure ``PlaybackClock``.
    """

    def __init__(self, loop_seconds: float, *, anchor: datetime | None = None) -> None:
        self._loop_seconds = float(loop_seconds)
        self._mode = LIVE
        self._seek: datetime | None = None
        # Anchor is captured once so LIVE playback advances smoothly from a fixed origin.
        self.anchor = _ensure_aware(anchor or datetime.now(timezone.utc))

    @property
    def loop_seconds(self) -> float:
        return self._loop_seconds

    @property
    def mode(self) -> str:
        return self._mode

    @property
    def seek_event_time(self) -> datetime | None:
        return self._seek

    def clock_for(self, window_start: datetime, window_end: datetime) -> PlaybackClock:
        return PlaybackClock(
            window_start=window_start,
            window_end=window_end,
            anchor=self.anchor,
            loop_seconds=self._loop_seconds,
            mode=self._mode,
            seek_event_time=self._seek,
        )

    # --- demo controls (called by POST /playback and, later, the WS control hook) ---
    def play(self) -> None:
        self._mode = LIVE
        self._seek = None

    def pause(self, at_event_time: datetime | None = None) -> None:
        self._mode = PAUSED
        if at_event_time is not None:
            self._seek = _ensure_aware(at_event_time)

    def seek(self, event_time: datetime) -> None:
        self._mode = SEEK
        self._seek = _ensure_aware(event_time)

    def set_speed(self, loop_seconds: float) -> None:
        if loop_seconds <= 0:
            raise ValueError("loop_seconds must be positive")
        self._loop_seconds = float(loop_seconds)


def _ensure_aware(t: datetime) -> datetime:
    """Treat naive datetimes as UTC so arithmetic never mixes aware/naive."""
    if t.tzinfo is None:
        return t.replace(tzinfo=timezone.utc)
    return t
