"""Milestone 3 auth + admin tests — login, tokens, role gates, data tasks.

Skips (not fails) if Postgres is unreachable, mirroring the M1/M2 suites.
"""
from __future__ import annotations

import time

import pytest
from sqlalchemy import text

from brimz.config import settings
from brimz.db.base import Base, SessionLocal, engine
from brimz.db import models  # noqa: F401
from brimz.seed import seed_all

ADMIN = {"email": "owner@brimz.tech", "password": settings.seed_admin_password}
MANAGER = {"email": "ops@brimz.tech", "password": settings.seed_manager_password}
VIEWER = {"email": "analyst@brimz.tech", "password": settings.seed_viewer_password}


def _db_available() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


pytestmark = pytest.mark.skipif(not _db_available(), reason="Postgres not reachable")


@pytest.fixture(scope="module")
def client():
    from fastapi.testclient import TestClient

    from brimz.api.main import app

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_all(session, n_attendees=100)
    with TestClient(app) as c:
        yield c


def _login(client, creds) -> dict:
    r = client.post("/api/v1/auth/login", json=creds)
    assert r.status_code == 200, r.text
    return r.json()


def _auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# ── Login / tokens ───────────────────────────────────────────────────────────

def test_login_ok(client):
    body = _login(client, ADMIN)
    assert body["token_type"] == "bearer"
    assert body["user"]["role"] == "Admin"
    assert body["access_token"] != body["refresh_token"]


def test_login_bad_password(client):
    r = client.post("/api/v1/auth/login", json={"email": ADMIN["email"], "password": "wrong"})
    assert r.status_code == 401


def test_login_unknown_email_same_error(client):
    r = client.post("/api/v1/auth/login", json={"email": "ghost@brimz.tech", "password": "x"})
    assert r.status_code == 401
    # Same message as a bad password — no account enumeration.
    assert r.json()["detail"] == "invalid email or password"


def test_refresh_flow(client):
    pair = _login(client, VIEWER)
    r = client.post("/api/v1/auth/refresh", json={"refresh_token": pair["refresh_token"]})
    assert r.status_code == 200
    assert r.json()["user"]["email"] == VIEWER["email"]


def test_access_token_rejected_as_refresh(client):
    pair = _login(client, VIEWER)
    r = client.post("/api/v1/auth/refresh", json={"refresh_token": pair["access_token"]})
    assert r.status_code == 401


def test_expired_token_rejected(client, monkeypatch):
    from brimz.api import security
    from brimz.db.models.extended import StaffUser

    monkeypatch.setattr(settings, "auth_access_ttl_minutes", -1)
    with SessionLocal() as session:
        user = session.query(StaffUser).filter_by(email=VIEWER["email"]).one()
        stale = security.create_token(user, "access")
    r = client.get("/api/v1/auth/me", headers=_auth(stale))
    assert r.status_code == 401
    assert r.json()["detail"] == "token expired"


def test_me_and_profile_update(client):
    pair = _login(client, MANAGER)
    headers = _auth(pair["access_token"])

    r = client.get("/api/v1/auth/me", headers=headers)
    assert r.status_code == 200
    assert r.json()["email"] == MANAGER["email"]

    # Name change alone is fine; password change requires the current password.
    r = client.patch("/api/v1/auth/me", json={"name": "Ops Boss"}, headers=headers)
    assert r.status_code == 200 and r.json()["name"] == "Ops Boss"

    r = client.patch("/api/v1/auth/me", json={"new_password": "a-new-password"}, headers=headers)
    assert r.status_code == 422
    r = client.patch(
        "/api/v1/auth/me",
        json={"current_password": "nope", "new_password": "a-new-password"},
        headers=headers,
    )
    assert r.status_code == 403
    r = client.patch(
        "/api/v1/auth/me",
        json={"current_password": MANAGER["password"], "new_password": "a-new-password"},
        headers=headers,
    )
    assert r.status_code == 200
    # New password works; restore the seeded one for the rest of the suite.
    pair2 = _login(client, {"email": MANAGER["email"], "password": "a-new-password"})
    client.patch(
        "/api/v1/auth/me",
        json={"current_password": "a-new-password", "new_password": MANAGER["password"]},
        headers=_auth(pair2["access_token"]),
    )


# ── Role gates ───────────────────────────────────────────────────────────────

def test_reads_require_auth(client):
    for path in ("/api/v1/events", "/api/v1/venues", "/api/v1/sponsors", "/api/v1/alerts"):
        assert client.get(path).status_code == 401
    assert client.get("/health").status_code == 200  # stays open for smoke/CI


def test_viewer_can_read_but_not_control(client):
    pair = _login(client, VIEWER)
    headers = _auth(pair["access_token"])
    assert client.get("/api/v1/events", headers=headers).status_code == 200
    assert client.get("/api/v1/playback", headers=headers).status_code == 200
    r = client.post("/api/v1/playback", json={"mode": "live"}, headers=headers)
    assert r.status_code == 403
    assert client.get("/api/v1/admin/status", headers=headers).status_code == 403


def test_manager_controls_playback_but_not_admin(client):
    pair = _login(client, MANAGER)
    headers = _auth(pair["access_token"])
    assert client.post("/api/v1/playback", json={"mode": "live"}, headers=headers).status_code == 200
    assert client.get("/api/v1/admin/status", headers=headers).status_code == 403


# ── WebSocket auth ───────────────────────────────────────────────────────────

def test_ws_requires_token(client):
    with client.websocket_connect("/api/v1/live?event_id=1") as ws:
        frame = ws.receive_json()
        assert frame["type"] == "error"
        assert "unauthorized" in frame["detail"]


def test_ws_viewer_cannot_control(client):
    pair = _login(client, VIEWER)
    with client.websocket_connect(f"/api/v1/live?event_id=1&token={pair['access_token']}") as ws:
        assert ws.receive_json()["type"] == "tick"
        ws.send_json({"cmd": "seek", "seek": "2026-06-15T20:24:00Z"})
        # The next non-tick frame must be the rejection; ticks may interleave.
        for _ in range(5):
            frame = ws.receive_json()
            if frame["type"] == "error":
                break
        assert frame["type"] == "error"


# ── Admin data tasks ─────────────────────────────────────────────────────────

def test_admin_status_and_seed_lifecycle(client):
    pair = _login(client, ADMIN)
    headers = _auth(pair["access_token"])

    r = client.get("/api/v1/admin/status", headers=headers)
    assert r.status_code == 200
    assert r.json()["attendees"] == 100

    r = client.post("/api/v1/admin/seed", json={"attendees": 60}, headers=headers)
    assert r.status_code == 202
    task = r.json()
    assert task["state"] == "running" and task["kind"] == "seed"

    deadline = time.time() + 120
    while time.time() < deadline:
        task = client.get("/api/v1/admin/task", headers=headers).json()
        if task["state"] != "running":
            break
        time.sleep(0.5)
    assert task["state"] == "done", task.get("error")
    assert task["counts"]["attendees"] == 60

    # Old token still valid after reseed (same user id is re-created deterministically).
    r = client.get("/api/v1/admin/status", headers=headers)
    assert r.status_code == 200
    assert r.json()["attendees"] == 60
