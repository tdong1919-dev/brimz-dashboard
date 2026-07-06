"""Auth primitives (Milestone 3): password hashing, JWTs, and role dependencies.

Roles come from the seeded `access_roles` (Admin > Manager > Viewer):
  - any authenticated user may read the dashboard API
  - Manager/Admin may drive playback
  - Admin only may use /admin (mock-data control)

Tokens are stateless HS256 JWTs (access + refresh). No server-side revocation —
an accepted MVP trade-off; logout is client-side (documented in the M3 plan).
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from brimz.api.deps import get_db
from brimz.config import settings
from brimz.db.models.extended import StaffUser

ALGORITHM = "HS256"
# Roles allowed to drive playback (the live-demo controls).
CONTROL_ROLES = ("Admin", "Manager")

_bearer = HTTPBearer(auto_error=False)


# ── Passwords ────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except ValueError:  # malformed hash
        return False


# ── Tokens ───────────────────────────────────────────────────────────────────

def create_token(user: StaffUser, kind: str) -> str:
    """kind = "access" | "refresh"."""
    ttl = (
        timedelta(minutes=settings.auth_access_ttl_minutes)
        if kind == "access"
        else timedelta(days=settings.auth_refresh_ttl_days)
    )
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "kind": kind,
        "iat": now,
        "exp": now + ttl,
    }
    return jwt.encode(payload, settings.auth_secret_key, algorithm=ALGORITHM)


def decode_token(token: str, expected_kind: str = "access") -> dict:
    """Return the payload or raise HTTP 401."""
    try:
        payload = jwt.decode(token, settings.auth_secret_key, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="invalid token")
    if payload.get("kind") != expected_kind:
        raise HTTPException(status_code=401, detail=f"expected a {expected_kind} token")
    return payload


def user_from_token(token: str, db: Session, expected_kind: str = "access") -> StaffUser:
    """Decode + load the user; raises HTTP 401 on any failure. Shared by HTTP + WS."""
    payload = decode_token(token, expected_kind)
    user = db.get(StaffUser, int(payload["sub"]))
    if user is None or not user.is_active:
        raise HTTPException(status_code=401, detail="unknown or inactive user")
    return user


# ── FastAPI dependencies ─────────────────────────────────────────────────────

def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> StaffUser:
    if creds is None:
        raise HTTPException(
            status_code=401,
            detail="not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user_from_token(creds.credentials, db)


def require_role(*roles: str):
    """Dependency factory: 403 unless the current user's role is one of `roles`."""

    def checker(user: StaffUser = Depends(get_current_user)) -> StaffUser:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail=f"requires role: {' or '.join(roles)}")
        return user

    return checker


def require_role_stateless(*roles: str):
    """Like require_role but validates the JWT only — no DB lookup.

    Needed for endpoints that must answer while the database is being rebuilt
    (GET /admin/task polls during a reseed, when staff_users may not exist).
    """

    def checker(creds: HTTPAuthorizationCredentials | None = Depends(_bearer)) -> dict:
        if creds is None:
            raise HTTPException(status_code=401, detail="not authenticated")
        payload = decode_token(creds.credentials)
        if payload.get("role") not in roles:
            raise HTTPException(status_code=403, detail=f"requires role: {' or '.join(roles)}")
        return payload

    return checker
