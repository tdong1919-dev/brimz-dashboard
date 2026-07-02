"""Shared FastAPI dependencies: request-scoped DB session + the playback controller."""
from __future__ import annotations

from collections.abc import Iterator

from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from brimz.config import settings
from brimz.db.base import SessionLocal
from brimz.db.models.core import Event
from brimz.api.playback import PlaybackController

# One process-local playback controller drives the demo loop for all clients.
controller = PlaybackController(loop_seconds=settings.playback_loop_seconds)


def get_db() -> Iterator[Session]:
    """Yield a session per request; always closed afterwards (reuses the M1 engine)."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_event_or_404(event_id: int, db: Session = Depends(get_db)) -> Event:
    event = db.get(Event, event_id)
    if event is None:
        raise HTTPException(status_code=404, detail=f"event {event_id} not found")
    return event
