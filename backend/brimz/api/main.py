"""FastAPI application factory for the Brimz backend (Milestones 2–3)."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from brimz.api.routers import admin, auth, commerce, events, live, ops, playback, venues
from brimz.config import settings
from brimz.db.base import SessionLocal

app = FastAPI(
    title="Brimz API",
    version="0.3.0",
    description="Crowd-energy analytics API + live playback engine + auth/admin (Milestones 2–3).",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["meta"])
def health() -> dict:
    """Liveness + DB connectivity check (smoke-test target)."""
    db_ok = True
    try:
        with SessionLocal() as session:
            session.execute(text("SELECT 1"))
    except Exception:
        db_ok = False
    return {"status": "ok" if db_ok else "degraded", "db": "ok" if db_ok else "down", "version": app.version}


for module in (auth, events, venues, commerce, ops, playback, live, admin):
    app.include_router(module.router)
