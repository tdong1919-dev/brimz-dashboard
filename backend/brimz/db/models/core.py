"""Phase 1a — core domain spine: venues, zones, events, attendees, segments, devices."""
from __future__ import annotations

from datetime import date

from sqlalchemy import (
    Boolean,
    Date,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from brimz.db.base import Base, TimestampMixin


class Venue(Base, TimestampMixin):
    __tablename__ = "venues"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    city: Mapped[str | None] = mapped_column(String(120))
    capacity: Mapped[int | None] = mapped_column(Integer)
    timezone: Mapped[str] = mapped_column(String(64), default="America/New_York")
    brand_primary_color: Mapped[str | None] = mapped_column(String(16))
    brand_logo_url: Mapped[str | None] = mapped_column(String(255))

    zones: Mapped[list["Zone"]] = relationship(back_populates="venue", cascade="all, delete-orphan")
    events: Mapped[list["Event"]] = relationship(back_populates="venue", cascade="all, delete-orphan")
    devices: Mapped[list["Device"]] = relationship(back_populates="venue", cascade="all, delete-orphan")


class Zone(Base):
    __tablename__ = "zones"
    __table_args__ = (UniqueConstraint("venue_id", "name", name="uq_zone_venue_name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    venue_id: Mapped[int] = mapped_column(ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    capacity: Mapped[int | None] = mapped_column(Integer)

    venue: Mapped[Venue] = relationship(back_populates="zones")


class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(primary_key=True)
    venue_id: Mapped[int] = mapped_column(ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="Planning", nullable=False)
    attendance: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    venue: Mapped[Venue] = relationship(back_populates="events")


class FanSegment(Base):
    __tablename__ = "fan_segments"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    avg_spend: Mapped[float | None] = mapped_column(Numeric(10, 2))
    avg_visits: Mapped[float | None] = mapped_column(Numeric(6, 2))
    engagement: Mapped[int | None] = mapped_column(Integer)

    members: Mapped[list["AttendeeSegment"]] = relationship(
        back_populates="segment", cascade="all, delete-orphan"
    )


class Attendee(Base, TimestampMixin):
    __tablename__ = "attendees"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_ref: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    age_band: Mapped[str | None] = mapped_column(String(16))
    gender: Mapped[str | None] = mapped_column(String(24))
    home_city: Mapped[str | None] = mapped_column(String(120))
    is_returning: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    segments: Mapped[list["AttendeeSegment"]] = relationship(
        back_populates="attendee", cascade="all, delete-orphan"
    )


class AttendeeSegment(Base):
    """Join table: which segments an attendee belongs to."""

    __tablename__ = "attendee_segments"

    attendee_id: Mapped[int] = mapped_column(
        ForeignKey("attendees.id", ondelete="CASCADE"), primary_key=True
    )
    segment_id: Mapped[int] = mapped_column(
        ForeignKey("fan_segments.id", ondelete="CASCADE"), primary_key=True
    )

    attendee: Mapped[Attendee] = relationship(back_populates="segments")
    segment: Mapped[FanSegment] = relationship(back_populates="members")


class Device(Base):
    __tablename__ = "devices"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    venue_id: Mapped[int] = mapped_column(ForeignKey("venues.id", ondelete="CASCADE"), nullable=False)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="SET NULL"))
    type: Mapped[str] = mapped_column(String(48), default="Wristband Hub", nullable=False)
    battery: Mapped[int] = mapped_column(Integer, default=100, nullable=False)
    status: Mapped[str] = mapped_column(String(24), default="Online", nullable=False)
    connected_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    venue: Mapped[Venue] = relationship(back_populates="devices")
    zone: Mapped[Zone | None] = relationship()
