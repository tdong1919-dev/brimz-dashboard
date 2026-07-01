"""Milestone 1 acceptance tests.

Requires the Docker Postgres to be running (docker compose up -d). If the DB is
unreachable, the whole module is skipped rather than failing spuriously.
"""
from __future__ import annotations

import pytest
from sqlalchemy import text

from brimz.db.base import Base, SessionLocal, engine
from brimz.db import models  # noqa: F401
from brimz.seed import seed_all
from brimz.validation import run_checks


def _db_available() -> bool:
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False


pytestmark = pytest.mark.skipif(not _db_available(), reason="Postgres not reachable")


@pytest.fixture(scope="module")
def seeded_session():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_all(session, n_attendees=100)
        yield session


def test_mock_data_stored(seeded_session):
    n = seeded_session.execute(text("SELECT count(*) FROM attendees")).scalar_one()
    assert n == 100
    events = seeded_session.execute(text("SELECT count(*) FROM events")).scalar_one()
    assert events == 5


def test_fitbit_data_stored(seeded_session):
    raw = seeded_session.execute(text("SELECT count(*) FROM fitbit_raw_payloads")).scalar_one()
    hr = seeded_session.execute(text("SELECT count(*) FROM fitbit_heartrate_samples")).scalar_one()
    assert raw > 0 and hr > 0


def test_jsonb_queryable(seeded_session):
    steps = seeded_session.execute(
        text("SELECT (payload->'summary'->>'steps')::int FROM fitbit_raw_payloads "
             "WHERE payload->'summary' ? 'steps' LIMIT 1")
    ).scalar_one()
    assert steps == 11840


def test_all_acceptance_checks_pass(seeded_session):
    result = run_checks(seeded_session)
    assert result.ok, "failed: " + "; ".join(result.failed)
