"""Commerce + marketing: sponsors, campaigns, UGC, fan segments, billing."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from brimz.api.deps import get_db
from brimz.api.schemas.extended import (
    BillingRecordOut,
    CampaignOut,
    FanSegmentOut,
    SponsorOut,
    SponsorROIOut,
    UGCOut,
)
from brimz.db.models.core import FanSegment
from brimz.db.models.extended import BillingRecord, Campaign, Sponsor, SponsorROI, UGCContent

router = APIRouter(prefix="/api/v1", tags=["commerce"])


@router.get("/sponsors", response_model=list[SponsorOut])
def list_sponsors(db: Session = Depends(get_db)):
    return db.execute(select(Sponsor).order_by(Sponsor.id)).scalars().all()


@router.get("/sponsor-roi", response_model=list[SponsorROIOut])
def list_sponsor_roi(db: Session = Depends(get_db)):
    return db.execute(select(SponsorROI).order_by(SponsorROI.roi.desc().nullslast())).scalars().all()


@router.get("/campaigns", response_model=list[CampaignOut])
def list_campaigns(db: Session = Depends(get_db)):
    return db.execute(select(Campaign).order_by(Campaign.id)).scalars().all()


@router.get("/ugc", response_model=list[UGCOut])
def list_ugc(
    db: Session = Depends(get_db),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
):
    return db.execute(
        select(UGCContent).order_by(UGCContent.shares.desc()).limit(limit).offset(offset)
    ).scalars().all()


@router.get("/fan-segments", response_model=list[FanSegmentOut])
def list_fan_segments(db: Session = Depends(get_db)):
    return db.execute(select(FanSegment).order_by(FanSegment.id)).scalars().all()


@router.get("/billing", response_model=list[BillingRecordOut])
def list_billing(db: Session = Depends(get_db)):
    return db.execute(
        select(BillingRecord).order_by(BillingRecord.created_at.desc())
    ).scalars().all()
