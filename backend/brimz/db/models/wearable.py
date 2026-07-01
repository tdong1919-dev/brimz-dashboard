"""Phase 1b — wearable / Fitbit layer + derived energy & engagement.

Hybrid storage: raw Fitbit payloads land in JSONB for fidelity/replay, and are
parsed into normalized sample tables for querying. Aggregates (energy, zone
engagement, engagement events) are what the dashboard ultimately renders.
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from brimz.db.base import Base, TimestampMixin


class FitbitAccount(Base, TimestampMixin):
    __tablename__ = "fitbit_accounts"

    id: Mapped[int] = mapped_column(primary_key=True)
    attendee_id: Mapped[int] = mapped_column(
        ForeignKey("attendees.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    fitbit_user_id: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    # OAuth fields are populated for real in Milestone 4; nullable until then.
    access_token: Mapped[str | None] = mapped_column(String(512))
    refresh_token: Mapped[str | None] = mapped_column(String(512))
    token_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    scopes: Mapped[str | None] = mapped_column(String(255))

    raw_payloads: Mapped[list["FitbitRawPayload"]] = relationship(
        back_populates="account", cascade="all, delete-orphan"
    )


class FitbitRawPayload(Base):
    """Raw Fitbit API response, stored verbatim as JSONB (the 'JSON management' deliverable)."""

    __tablename__ = "fitbit_raw_payloads"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("fitbit_accounts.id", ondelete="CASCADE"), nullable=False
    )
    endpoint: Mapped[str] = mapped_column(String(128), nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    account: Mapped[FitbitAccount] = relationship(back_populates="raw_payloads")


class FitbitActivitySample(Base):
    __tablename__ = "fitbit_activity_samples"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("fitbit_accounts.id", ondelete="CASCADE"), nullable=False
    )
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"))
    source_payload_id: Mapped[int | None] = mapped_column(
        ForeignKey("fitbit_raw_payloads.id", ondelete="SET NULL")
    )
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    steps: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    calories: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class FitbitHeartrateSample(Base):
    __tablename__ = "fitbit_heartrate_samples"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("fitbit_accounts.id", ondelete="CASCADE"), nullable=False
    )
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"))
    source_payload_id: Mapped[int | None] = mapped_column(
        ForeignKey("fitbit_raw_payloads.id", ondelete="SET NULL")
    )
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    bpm: Mapped[int] = mapped_column(Integer, nullable=False)
    hr_zone: Mapped[str | None] = mapped_column(String(24))


class EnergySample(Base):
    """Derived crowd 'energy' timeline for an event (optionally per zone)."""

    __tablename__ = "energy_samples"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="SET NULL"))
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    label: Mapped[str | None] = mapped_column(String(64))
    energy_value: Mapped[int] = mapped_column(Integer, nullable=False)


class ZoneEngagement(Base):
    """Per-zone engagement score for an event."""

    __tablename__ = "zone_engagement"
    __table_args__ = (UniqueConstraint("event_id", "zone_id", name="uq_zone_engagement"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id", ondelete="CASCADE"), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    vs_avg: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    filled_pct: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class EngagementEvent(Base):
    """Time-series counts of fan interactions (polls / challenges / rewards / shares)."""

    __tablename__ = "engagement_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    type: Mapped[str] = mapped_column(String(24), nullable=False)  # poll|challenge|reward|share
    count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
