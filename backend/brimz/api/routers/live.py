"""WebSocket live feed — streams stadium-state ticks as the playhead advances.

  WS /api/v1/live?event_id=<id>&token=<jwt>

M3: the socket requires a valid access token via `?token=` (browsers cannot set
WS headers). On connect the client gets an immediate snapshot, then a `tick`
frame every `playback_tick_seconds`. The socket is server→client for rendering,
but it also *accepts* control frames ({"cmd": "play"|"pause"|"seek", ...}) from
Manager/Admin users — Viewers' control frames are answered with an error frame.
The authoritative control path remains POST /playback.

DB access is synchronous (SQLAlchemy), so tick assembly runs in a threadpool to
avoid blocking the event loop.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.concurrency import run_in_threadpool

from brimz.api.deps import controller
from brimz.api.playback.state import build_tick, now_utc
from brimz.api.security import CONTROL_ROLES, user_from_token
from brimz.config import settings
from brimz.db.base import SessionLocal

router = APIRouter(tags=["live"])


def _tick_payload(event_id: int, now: datetime):
    """Build one tick with its own short-lived session (runs in a worker thread)."""
    session = SessionLocal()
    try:
        tick = build_tick(session, controller, event_id, now)
        return tick.model_dump(mode="json") if tick is not None else None
    finally:
        session.close()


def _apply_control(msg: dict) -> None:
    """M3 hook: let a client drive playback over the same socket."""
    cmd = (msg or {}).get("cmd")
    if cmd == "play":
        controller.play()
    elif cmd == "pause":
        controller.pause(_parse_dt(msg.get("seek")))
    elif cmd == "seek":
        at = _parse_dt(msg.get("seek"))
        if at is not None:
            controller.seek(at)
    elif cmd == "speed":
        try:
            controller.set_speed(float(msg.get("loop_seconds")))
        except (TypeError, ValueError):
            pass


def _parse_dt(value) -> datetime | None:
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except ValueError:
        return None


def _authenticate(token: str | None) -> tuple[str | None, str | None]:
    """Return (role, error). Runs in a worker thread (sync DB access)."""
    if not token:
        return None, "missing token"
    session = SessionLocal()
    try:
        user = user_from_token(token, session)
        return user.role, None
    except HTTPException as exc:
        return None, str(exc.detail)
    finally:
        session.close()


@router.websocket("/api/v1/live")
async def live_feed(websocket: WebSocket, event_id: int = Query(None), token: str = Query(None)):
    await websocket.accept()
    eid = event_id or settings.playback_default_event_id

    role, auth_error = await run_in_threadpool(_authenticate, token)
    if role is None:
        await websocket.send_json({"type": "error", "detail": f"unauthorized: {auth_error}"})
        await websocket.close(code=1008)
        return
    can_control = role in CONTROL_ROLES

    first = await run_in_threadpool(_tick_payload, eid, now_utc())
    if first is None:
        await websocket.send_json({"type": "error", "detail": f"no energy data for event {eid}"})
        await websocket.close()
        return

    async def receiver() -> None:
        # Drain client control frames (Manager/Admin only).
        while True:
            msg = await websocket.receive_json()
            if can_control:
                _apply_control(msg)
            else:
                await websocket.send_json({"type": "error", "detail": "control requires Manager or Admin"})

    async def sender() -> None:
        await websocket.send_json(first)
        while True:
            await asyncio.sleep(settings.playback_tick_seconds)
            payload = await run_in_threadpool(_tick_payload, eid, now_utc())
            if payload is not None:
                await websocket.send_json(payload)

    recv_task = asyncio.ensure_future(receiver())
    send_task = asyncio.ensure_future(sender())
    try:
        await asyncio.wait({recv_task, send_task}, return_when=asyncio.FIRST_COMPLETED)
    except WebSocketDisconnect:
        pass
    finally:
        for t in (recv_task, send_task):
            t.cancel()
