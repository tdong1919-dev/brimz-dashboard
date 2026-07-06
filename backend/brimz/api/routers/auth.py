"""Auth endpoints (Milestone 3): login, refresh, current-user profile.

Open (no token): POST /auth/login, POST /auth/refresh. Everything else in the
API requires a Bearer access token (see security.py).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from brimz.api.deps import get_db
from brimz.api.schemas.auth import LoginIn, MeUpdateIn, RefreshIn, TokenPairOut, UserOut
from brimz.api.security import (
    create_token,
    get_current_user,
    hash_password,
    user_from_token,
    verify_password,
)
from brimz.db.models.extended import StaffUser

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def _token_pair(user: StaffUser) -> TokenPairOut:
    return TokenPairOut(
        access_token=create_token(user, "access"),
        refresh_token=create_token(user, "refresh"),
        user=UserOut.model_validate(user, from_attributes=True),
    )


@router.post("/login", response_model=TokenPairOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.execute(select(StaffUser).where(StaffUser.email == email)).scalar_one_or_none()
    # One error message for every failure mode — don't leak which emails exist.
    if (
        user is None
        or not user.is_active
        or user.password_hash is None
        or not verify_password(body.password, user.password_hash)
    ):
        raise HTTPException(status_code=401, detail="invalid email or password")
    return _token_pair(user)


@router.post("/refresh", response_model=TokenPairOut)
def refresh(body: RefreshIn, db: Session = Depends(get_db)):
    user = user_from_token(body.refresh_token, db, expected_kind="refresh")
    return _token_pair(user)


@router.get("/me", response_model=UserOut)
def me(user: StaffUser = Depends(get_current_user)):
    return user


@router.patch("/me", response_model=UserOut)
def update_me(
    body: MeUpdateIn,
    user: StaffUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.new_password is not None:
        if body.current_password is None or user.password_hash is None:
            raise HTTPException(status_code=422, detail="current_password is required to set a new password")
        if not verify_password(body.current_password, user.password_hash):
            raise HTTPException(status_code=403, detail="current password is incorrect")
        user.password_hash = hash_password(body.new_password)
    if body.name is not None:
        user.name = body.name.strip()
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
