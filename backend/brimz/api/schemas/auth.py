"""Request/response schemas for the auth surface (Milestone 3)."""
from __future__ import annotations

from pydantic import BaseModel, Field


class UserOut(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool


class LoginIn(BaseModel):
    email: str = Field(min_length=3, max_length=160)
    password: str = Field(min_length=1)


class RefreshIn(BaseModel):
    refresh_token: str


class TokenPairOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class MeUpdateIn(BaseModel):
    """PATCH /auth/me — profile edits; password change requires the current password."""

    name: str | None = Field(None, min_length=1, max_length=120)
    current_password: str | None = None
    new_password: str | None = Field(None, min_length=8, max_length=128)
