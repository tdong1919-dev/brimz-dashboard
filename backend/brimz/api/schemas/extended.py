"""Response schemas for the extended domain: commerce, marketing, ops."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class RevenueLineOut(ORMModel):
    category: str
    amount: float
    pct: int | None = None


class TransactionOut(ORMModel):
    id: int
    amount: float
    kind: str
    ts: datetime


class SponsorOut(ORMModel):
    id: int
    name: str
    tier: str | None = None


class SponsorROIOut(ORMModel):
    sponsor_id: int
    event_id: int | None = None
    impressions: int
    engagements: int
    clicks: int
    conversions: int
    roi: float | None = None


class CampaignOut(ORMModel):
    id: int
    name: str
    type: str | None = None
    status: str
    reach: int | None = None
    engagement_pct: float | None = None
    conversion_pct: float | None = None


class UGCOut(ORMModel):
    id: int
    event_id: int | None = None
    type: str | None = None
    platform: str | None = None
    shares: int
    likes: int
    hashtag: str | None = None
    posted_at: datetime | None = None


class AlertOut(ORMModel):
    id: int
    event_id: int | None = None
    zone_id: int | None = None
    level: str
    title: str
    message: str | None = None
    created_at: datetime


class FanSegmentOut(ORMModel):
    id: int
    name: str
    avg_spend: float | None = None
    avg_visits: float | None = None
    engagement: int | None = None
    count: int = 0  # live membership size (M3)


class IntegrationOut(ORMModel):
    id: int
    name: str
    category: str | None = None
    status: str
    connected: bool


class BillingRecordOut(ORMModel):
    id: int
    description: str
    amount: float
    status: str
    period: str | None = None
    created_at: datetime


class StaffUserOut(ORMModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool


class AccessRoleOut(ORMModel):
    id: int
    name: str
    description: str | None = None
