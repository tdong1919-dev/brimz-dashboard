"""Response schemas for the core spine: venues, zones, events, KPIs, crowd data."""
from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class VenueOut(ORMModel):
    id: int
    slug: str
    name: str
    city: str | None = None
    capacity: int | None = None
    timezone: str
    brand_primary_color: str | None = None
    brand_logo_url: str | None = None


class ZoneOut(ORMModel):
    id: int
    venue_id: int
    name: str
    capacity: int | None = None


class EventOut(ORMModel):
    id: int
    venue_id: int
    name: str
    event_date: date
    status: str
    attendance: int


class TimelinePointOut(BaseModel):
    ts: datetime
    label: str | None = None
    energy_value: int


class KpiOut(BaseModel):
    label: str
    value: str
    suffix: str | None = None
    sub: str | None = None


class ZoneEngagementOut(BaseModel):
    zone_id: int
    zone: str
    score: int
    vs_avg: int
    filled_pct: int
    capacity: int | None = None


class MomentOut(ORMModel):
    rank: int
    label: str
    occurred_at: datetime | None = None
    energy: int | None = None


class EmotionOut(BaseModel):
    label: str
    pct: int


class EmotionsOut(BaseModel):
    emotions: list[EmotionOut]
    drivers: list[EmotionOut]


class EngagementPointOut(BaseModel):
    ts: datetime
    type: str
    count: int


class DeviceOut(ORMModel):
    id: int
    code: str
    type: str
    battery: int
    status: str
    connected_count: int
    zone: str | None = None


class DemographicsOut(BaseModel):
    total: int
    returning_pct: int
    age_bands: list[dict]
    gender: list[dict]
    locations: list[dict]
