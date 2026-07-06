"""Admin-only mock-data control (Milestone 3) — the API face of the M1 CLI.

Wraps the same primitives as `brimz seed/reset/status` so the dashboard's Admin
screen can reshape the simulated stadium:

  GET  /api/v1/admin/status   row counts per table
  POST /api/v1/admin/seed     reset + reseed (background task; returns task id)
  POST /api/v1/admin/reset    drop + recreate tables, optional reseed (background)
  GET  /api/v1/admin/task     state of the current/last task

Seeding takes seconds (bcrypt + tens of thousands of rows), so mutations run in
a single background thread; only one task may run at a time (409 otherwise).
Playback keeps streaming while data changes — ticks may briefly see partial
data mid-reseed, which is acceptable for the demo (flagged in the M3 plan).
"""
from __future__ import annotations

import threading
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import inspect, text

from brimz.api.schemas.admin import AdminStatusOut, AdminTaskOut, ResetIn, SeedIn
from brimz.api.security import require_role, require_role_stateless
from brimz.config import settings
from brimz.db.base import Base, SessionLocal, engine
from brimz.db import models  # noqa: F401  (register all models on Base)

# No router-level guard: /task must stay answerable mid-reseed, so it uses a
# JWT-only check while the other endpoints use the DB-backed Admin dependency.
router = APIRouter(prefix="/api/v1/admin", tags=["admin"])
_admin = Depends(require_role("Admin"))

# ── Background task registry (one slot — the demo has one admin) ─────────────

_lock = threading.Lock()
_task: dict | None = None
_task_seq = 0


def _start_task(kind: str, target, **kwargs) -> dict:
    """Start `target` in a thread unless a task is already running (409)."""
    global _task, _task_seq
    with _lock:
        if _task is not None and _task["state"] == "running":
            raise HTTPException(status_code=409, detail=f"a {_task['kind']} task is already running")
        _task_seq += 1
        _task = {
            "id": _task_seq,
            "kind": kind,
            "state": "running",
            "attendees": kwargs.get("attendees"),
            "error": None,
            "counts": None,
            "started_at": datetime.now(timezone.utc),
            "finished_at": None,
        }
        record = _task

    def runner() -> None:
        try:
            counts = target(**kwargs)
            with _lock:
                record["counts"] = counts
                record["state"] = "done"
        except Exception as exc:  # surfaced via GET /admin/task
            with _lock:
                record["error"] = str(exc)
                record["state"] = "failed"
        finally:
            with _lock:
                record["finished_at"] = datetime.now(timezone.utc)

    threading.Thread(target=runner, name=f"brimz-admin-{kind}", daemon=True).start()
    return record


def _recreate_tables() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _run_seed(attendees: int | None = None) -> dict[str, int]:
    from brimz.seed import seed_all

    _recreate_tables()
    with SessionLocal() as session:
        return seed_all(session, n_attendees=attendees)


def _run_reset(reseed: bool = False, attendees: int | None = None) -> dict[str, int]:
    if reseed:
        return _run_seed(attendees)
    _recreate_tables()
    return {}


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.get("/status", response_model=AdminStatusOut, dependencies=[_admin])
def status():
    insp = inspect(engine)
    tables: dict[str, int] = {}
    with SessionLocal() as session:
        for t in sorted(insp.get_table_names()):
            if t == "alembic_version":
                continue
            tables[t] = session.execute(text(f'SELECT count(*) FROM "{t}"')).scalar_one()
    return AdminStatusOut(
        tables=tables,
        total=sum(tables.values()),
        attendees=tables.get("attendees", 0),
        demo_event_id=settings.playback_default_event_id,
    )


@router.post("/seed", response_model=AdminTaskOut, status_code=202, dependencies=[_admin])
def seed(body: SeedIn):
    return _start_task("seed", _run_seed, attendees=body.attendees)


@router.post("/reset", response_model=AdminTaskOut, status_code=202, dependencies=[_admin])
def reset(body: ResetIn):
    return _start_task("reset", _run_reset, reseed=body.reseed, attendees=body.attendees)


@router.get(
    "/task",
    response_model=AdminTaskOut,
    # JWT-only auth: polled while tables are being dropped/recreated, when the
    # DB-backed user lookup (the router-level dependency) cannot succeed.
    dependencies=[Depends(require_role_stateless("Admin"))],
)
def task():
    with _lock:
        if _task is None:
            raise HTTPException(status_code=404, detail="no data task has run yet")
        return AdminTaskOut(**_task)
