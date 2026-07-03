"""Phase 1c — extended dashboard domain.

Backs the remaining dashboard pages (revenue, sponsorship, campaigns, UGC,
alerts, moments, emotions, staff/access, integrations, billing). These trail the
M1 acceptance spine but are part of the client-requested full-domain scope.
"""
from __future__ import annotations

from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from brimz.db.base import Base, TimestampMixin


class RevenueLine(Base):
    __tablename__ = "revenue_lines"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[str] = mapped_column(String(48), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(14, 2), nullable=False)
    pct: Mapped[int | None] = mapped_column(Integer)


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    kind: Mapped[str] = mapped_column(String(32), default="Ticketing", nullable=False)
    ts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class Sponsor(Base):
    __tablename__ = "sponsors"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    tier: Mapped[str | None] = mapped_column(String(24))


class SponsorROI(Base):
    __tablename__ = "sponsor_roi"

    id: Mapped[int] = mapped_column(primary_key=True)
    sponsor_id: Mapped[int] = mapped_column(ForeignKey("sponsors.id", ondelete="CASCADE"), nullable=False)
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"))
    impressions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    engagements: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    clicks: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    conversions: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    roi: Mapped[float | None] = mapped_column(Numeric(6, 2))


class Campaign(Base):
    __tablename__ = "campaigns"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    type: Mapped[str | None] = mapped_column(String(32))
    status: Mapped[str] = mapped_column(String(24), default="Draft", nullable=False)
    reach: Mapped[int | None] = mapped_column(Integer)
    engagement_pct: Mapped[float | None] = mapped_column(Numeric(5, 2))
    conversion_pct: Mapped[float | None] = mapped_column(Numeric(5, 2))


class UGCContent(Base):
    __tablename__ = "ugc_content"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"))
    type: Mapped[str | None] = mapped_column(String(24))
    platform: Mapped[str | None] = mapped_column(String(32))
    shares: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    likes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    hashtag: Mapped[str | None] = mapped_column(String(64))
    posted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id", ondelete="SET NULL"))
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="SET NULL"))
    level: Mapped[str] = mapped_column(String(16), default="info", nullable=False)  # info|warning|error
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    message: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class TopMoment(Base):
    __tablename__ = "top_moments"
    __table_args__ = (UniqueConstraint("event_id", "rank", name="uq_top_moment_rank"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    rank: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str] = mapped_column(String(160), nullable=False)
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    energy: Mapped[int | None] = mapped_column(Integer)


class Emotion(Base):
    """Fan emotion distribution and its drivers for an event (kind = emotion|driver)."""

    __tablename__ = "emotions"

    id: Mapped[int] = mapped_column(primary_key=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    kind: Mapped[str] = mapped_column(String(16), default="emotion", nullable=False)
    label: Mapped[str] = mapped_column(String(48), nullable=False)
    pct: Mapped[int] = mapped_column(Integer, nullable=False)


class CrowdTrigger(Base):
    __tablename__ = "crowd_triggers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)


class StaffUser(Base, TimestampMixin):
    __tablename__ = "staff_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(160), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(48), default="Viewer", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # NULL = user cannot log in (pre-M3 rows). Set by the seeder / future user admin.
    password_hash: Mapped[str | None] = mapped_column(String(255))


class AccessRole(Base):
    __tablename__ = "access_roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(48), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))


class Integration(Base):
    __tablename__ = "integrations"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    category: Mapped[str | None] = mapped_column(String(48))
    status: Mapped[str] = mapped_column(String(24), default="Available", nullable=False)
    connected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)


class BillingRecord(Base):
    __tablename__ = "billing_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str] = mapped_column(String(160), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="Pending", nullable=False)
    period: Mapped[str | None] = mapped_column(String(32))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
