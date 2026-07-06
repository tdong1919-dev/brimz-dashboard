"""Schemas for the Admin-only mock-data control surface (Milestone 3)."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class AdminStatusOut(BaseModel):
    """Row counts per table — what data the stadium simulation is playing."""

    tables: dict[str, int]
    total: int
    attendees: int
    demo_event_id: int


class SeedIn(BaseModel):
    """POST /admin/seed — reseeds from scratch (tables are reset first)."""

    attendees: int | None = Field(None, ge=1, le=100_000, description="Attendee rows to generate")


class ResetIn(BaseModel):
    """POST /admin/reset — drop + recreate all tables, optionally reseed after."""

    reseed: bool = False
    attendees: int | None = Field(None, ge=1, le=100_000)


class AdminTaskOut(BaseModel):
    """State of the current/last background data task."""

    id: int
    kind: str                      # seed | reset
    state: str                     # running | done | failed
    attendees: int | None = None
    error: str | None = None
    counts: dict[str, int] | None = None
    started_at: datetime
    finished_at: datetime | None = None
