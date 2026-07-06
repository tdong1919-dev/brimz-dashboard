"""Unit tests for the playback clock — pure math, no DB, always run in CI."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from brimz.api.playback.clock import LIVE, PAUSED, SEEK, PlaybackClock, PlaybackController

START = datetime(2026, 6, 15, 18, 0, tzinfo=timezone.utc)
END = datetime(2026, 6, 15, 23, 0, tzinfo=timezone.utc)   # 5h window = 18000s
ANCHOR = datetime(2026, 1, 1, 0, 0, tzinfo=timezone.utc)


def clock(**kw) -> PlaybackClock:
    base = dict(window_start=START, window_end=END, anchor=ANCHOR, loop_seconds=300.0)
    base.update(kw)
    return PlaybackClock(**base)


def test_speed_is_window_over_loop():
    assert clock().speed == pytest.approx(18000 / 300)  # 60x


def test_playhead_at_anchor_is_window_start():
    assert clock().playhead(ANCHOR) == START


def test_playhead_advances_with_wallclock():
    # 150 wall-seconds = half a 300s loop = halfway through the window (2h30m in)
    head = clock().playhead(ANCHOR + timedelta(seconds=150))
    assert head == START + timedelta(seconds=9000)


def test_playhead_loops_at_full_period():
    # A full loop_seconds later returns to the window start (wraps around).
    assert clock().playhead(ANCHOR + timedelta(seconds=300)) == START
    # 1.5 loops in => same as half a loop.
    assert clock().playhead(ANCHOR + timedelta(seconds=450)) == START + timedelta(seconds=9000)


def test_seek_holds_event_time():
    peak = START + timedelta(hours=2, minutes=24)
    c = clock(mode=SEEK, seek_event_time=peak)
    # Frozen regardless of wall-clock.
    assert c.playhead(ANCHOR) == peak
    assert c.playhead(ANCHOR + timedelta(seconds=999)) == peak


def test_seek_clamps_outside_window():
    c = clock(mode=SEEK, seek_event_time=END + timedelta(hours=1))
    assert c.playhead(ANCHOR) == END


def test_paused_without_seek_holds_start():
    assert clock(mode=PAUSED).playhead(ANCHOR + timedelta(seconds=123)) == START


def test_loop_fraction():
    assert clock().loop_fraction(ANCHOR) == pytest.approx(0.0)
    assert clock().loop_fraction(ANCHOR + timedelta(seconds=150)) == pytest.approx(0.5)


def test_invalid_window_rejected():
    with pytest.raises(ValueError):
        clock(window_end=START)


def test_invalid_loop_seconds_rejected():
    with pytest.raises(ValueError):
        clock(loop_seconds=0)


def test_controller_produces_clock_and_controls():
    ctl = PlaybackController(loop_seconds=300.0, anchor=ANCHOR)
    assert ctl.mode == LIVE
    ctl.seek(START + timedelta(hours=1))
    c = ctl.clock_for(START, END)
    assert c.mode == SEEK
    assert c.playhead(ANCHOR) == START + timedelta(hours=1)
    ctl.play()
    assert ctl.clock_for(START, END).mode == LIVE
    ctl.set_speed(60.0)
    assert ctl.clock_for(START, END).loop_seconds == 60.0
