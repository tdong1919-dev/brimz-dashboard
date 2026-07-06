"""Venues, zones, devices, and the attendee-demographics rollup."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from brimz.api.deps import get_db
from brimz.api.security import get_current_user
from brimz.api.schemas.core import DemographicsOut, DeviceOut, VenueOut, ZoneOut
from brimz.db.models.core import Attendee, Device, Venue, Zone

router = APIRouter(prefix="/api/v1", tags=["venues"], dependencies=[Depends(get_current_user)])


@router.get("/venues", response_model=list[VenueOut])
def list_venues(db: Session = Depends(get_db)):
    return db.execute(select(Venue).order_by(Venue.id)).scalars().all()


@router.get("/venues/{venue_id}", response_model=VenueOut)
def get_venue(venue_id: int, db: Session = Depends(get_db)):
    venue = db.get(Venue, venue_id)
    if venue is None:
        raise HTTPException(status_code=404, detail=f"venue {venue_id} not found")
    return venue


@router.get("/venues/{venue_id}/zones", response_model=list[ZoneOut])
def get_venue_zones(venue_id: int, db: Session = Depends(get_db)):
    return db.execute(
        select(Zone).where(Zone.venue_id == venue_id).order_by(Zone.id)
    ).scalars().all()


@router.get("/devices", response_model=list[DeviceOut])
def list_devices(db: Session = Depends(get_db)):
    rows = db.execute(
        select(Device, Zone.name).join(Zone, Zone.id == Device.zone_id, isouter=True).order_by(Device.id)
    ).all()
    return [
        DeviceOut(
            id=d.id, code=d.code, type=d.type, battery=d.battery, status=d.status,
            connected_count=d.connected_count, zone=zone_name,
        )
        for d, zone_name in rows
    ]


def _dist(db: Session, column) -> list[dict]:
    """Percentage distribution of a categorical attendee column."""
    total = db.execute(select(func.count()).select_from(Attendee)).scalar() or 0
    if not total:
        return []
    rows = db.execute(
        select(column, func.count()).group_by(column).order_by(func.count().desc())
    ).all()
    return [
        {"name": val or "Unknown", "pct": round(100 * n / total)}
        for val, n in rows
    ]


@router.get("/demographics", response_model=DemographicsOut)
def get_demographics(db: Session = Depends(get_db)):
    total = db.execute(select(func.count()).select_from(Attendee)).scalar() or 0
    returning = db.execute(
        select(func.count()).select_from(Attendee).where(Attendee.is_returning.is_(True))
    ).scalar() or 0
    return DemographicsOut(
        total=total,
        returning_pct=round(100 * returning / total) if total else 0,
        age_bands=[{"group": r["name"], "pct": r["pct"]} for r in _dist(db, Attendee.age_band)],
        gender=_dist(db, Attendee.gender),
        locations=[{"city": r["name"], "pct": r["pct"]} for r in _dist(db, Attendee.home_city)],
    )
