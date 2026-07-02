"""Operations: alerts (global), integrations, staff, access roles."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from brimz.api.deps import get_db
from brimz.api.schemas.extended import (
    AccessRoleOut,
    AlertOut,
    IntegrationOut,
    StaffUserOut,
)
from brimz.db.models.extended import AccessRole, Alert, Integration, StaffUser

router = APIRouter(prefix="/api/v1", tags=["ops"])


@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(
    db: Session = Depends(get_db),
    event_id: int | None = Query(None, description="Filter to one event"),
    limit: int = Query(100, ge=1, le=1000),
):
    stmt = select(Alert).order_by(Alert.created_at.desc()).limit(limit)
    if event_id is not None:
        stmt = stmt.where(Alert.event_id == event_id)
    return db.execute(stmt).scalars().all()


@router.get("/integrations", response_model=list[IntegrationOut])
def list_integrations(db: Session = Depends(get_db)):
    return db.execute(select(Integration).order_by(Integration.id)).scalars().all()


@router.get("/staff", response_model=list[StaffUserOut])
def list_staff(db: Session = Depends(get_db)):
    return db.execute(select(StaffUser).order_by(StaffUser.id)).scalars().all()


@router.get("/access-roles", response_model=list[AccessRoleOut])
def list_access_roles(db: Session = Depends(get_db)):
    return db.execute(select(AccessRole).order_by(AccessRole.id)).scalars().all()
