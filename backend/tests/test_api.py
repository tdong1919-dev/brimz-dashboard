"""Milestone 2 API tests — FastAPI TestClient against the seeded DB.

Skips (not fails) if Postgres is unreachable, mirroring the M1 acceptance suite.
"""
from __future__ import annotations

import pytest
from sqlalchemy import text

from brimz.db.base import Base, SessionLocal, engine
from brimz.db import models  # noqa: F401
from brimz.seed import seed_all


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

    from brimz.api.deps import controller
    from brimz.api.main import app

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_all(session, n_attendees=100)
    controller.play()  # ensure a clean LIVE state for each run
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["db"] == "ok"


def test_events_list(client):
    r = client.get("/api/v1/events")
    assert r.status_code == 200
    assert len(r.json()) == 5


def test_event_404(client):
    assert client.get("/api/v1/events/999").status_code == 404


def test_energy_timeline(client):
    r = client.get("/api/v1/events/1/energy")
    assert r.status_code == 200
    pts = r.json()
    assert pts, "expected a venue-wide energy timeline"
    assert max(p["energy_value"] for p in pts) == 98000  # the seeded PEAK


def test_state_has_distinct_per_zone_energy(client):
    """The live snapshot must give sections independent energy (the sim's whole point)."""
    r = client.get("/api/v1/events/1/state")
    assert r.status_code == 200
    body = r.json()
    assert body["total_energy"] > 0
    energies = {z["zone_id"]: z["energy"] for z in body["zones"]}
    assert len(energies) >= 2
    assert len(set(energies.values())) > 1  # zones are not all identical


def test_seek_freezes_playhead_at_peak(client):
    r = client.post("/api/v1/playback", json={"mode": "seek", "seek": "2026-06-15T20:24:00Z"})
    assert r.status_code == 200
    assert r.json()["mode"] == "seek"
    s1 = client.get("/api/v1/events/1/state").json()
    s2 = client.get("/api/v1/events/1/state").json()
    assert s1["playhead"] == s2["playhead"] == "2026-06-15T20:24:00Z"
    assert s1["total_energy"] == 98000  # interpolation lands exactly on the peak sample
    client.post("/api/v1/playback", json={"mode": "live"})  # restore


def test_seek_requires_time(client):
    assert client.post("/api/v1/playback", json={"mode": "seek"}).status_code == 422


def test_kpis_and_zones(client):
    assert len(client.get("/api/v1/events/1/kpis").json()) == 6
    zones = client.get("/api/v1/events/1/zones").json()
    assert len(zones) == 6
    assert zones[0]["score"] >= zones[-1]["score"]  # sorted by score desc


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/venues", "/api/v1/devices", "/api/v1/demographics",
        "/api/v1/sponsors", "/api/v1/sponsor-roi", "/api/v1/campaigns", "/api/v1/ugc",
        "/api/v1/fan-segments", "/api/v1/billing", "/api/v1/alerts",
        "/api/v1/integrations", "/api/v1/staff", "/api/v1/access-roles",
        "/api/v1/events/1/moments", "/api/v1/events/1/emotions",
        "/api/v1/events/1/engagement", "/api/v1/events/1/revenue",
        "/api/v1/events/1/transactions", "/api/v1/events/1/alerts",
    ],
)
def test_endpoint_ok(client, path):
    assert client.get(path).status_code == 200


def test_websocket_streams_ticks(client):
    with client.websocket_connect("/api/v1/live?event_id=1") as ws:
        frame = ws.receive_json()
        assert frame["type"] == "tick"
        assert frame["state"]["event_id"] == 1
        assert len(frame["state"]["zones"]) == 6
        # A client control frame drives playback over the same socket.
        ws.send_json({"cmd": "seek", "seek": "2026-06-15T20:24:00Z"})
        nxt = ws.receive_json()
        assert nxt["playback"]["playhead"] == "2026-06-15T20:24:00Z"
    client.post("/api/v1/playback", json={"mode": "live"})  # restore
