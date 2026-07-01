"""Admin CLI primitives for Milestone 1.

These are the operations a future admin UI (Milestone 3) will call to control the
demo/mock data:

    brimz init      create tables (if absent)
    brimz reset     drop + recreate all tables
    brimz seed      load mock data + Fitbit fixture data
    brimz validate  run integrity + acceptance checks
    brimz status    show row counts per table
"""
from __future__ import annotations

import argparse
import sys

from sqlalchemy import inspect, text

from brimz.config import settings
from brimz.db.base import Base, SessionLocal, engine
from brimz.db import models  # noqa: F401  (ensures all models are registered)


def _create_all() -> None:
    Base.metadata.create_all(bind=engine)


def _drop_all() -> None:
    Base.metadata.drop_all(bind=engine)


def cmd_init(_: argparse.Namespace) -> int:
    _create_all()
    print("✓ tables created (existing tables left intact)")
    return 0


def cmd_reset(_: argparse.Namespace) -> int:
    _drop_all()
    _create_all()
    print("✓ database reset: all tables dropped and recreated")
    return 0


def cmd_seed(args: argparse.Namespace) -> int:
    from brimz.seed import seed_all

    if args.reset:
        _drop_all()
        _create_all()
        print("✓ tables reset before seeding")
    elif not inspect(engine).has_table("venues"):
        _create_all()
        print("✓ tables created before seeding")

    with SessionLocal() as session:
        counts = seed_all(session, n_attendees=args.attendees)
    total = sum(counts.values())
    print(f"✓ seeded {total} rows across {len(counts)} tables:")
    for table, n in counts.items():
        print(f"    {table:<28} {n:>7}")
    return 0


def cmd_validate(_: argparse.Namespace) -> int:
    from brimz.validation import run_checks

    with SessionLocal() as session:
        result = run_checks(session)
    for line in result.passed:
        print(f"  ✓ {line}")
    for line in result.failed:
        print(f"  ✗ {line}")
    print()
    if result.ok:
        print(f"✓ ALL {len(result.passed)} CHECKS PASSED — Milestone 1 acceptance criteria met")
        return 0
    print(f"✗ {len(result.failed)} check(s) FAILED ({len(result.passed)} passed)")
    return 1


def cmd_status(_: argparse.Namespace) -> int:
    insp = inspect(engine)
    tables = sorted(insp.get_table_names())
    if not tables:
        print("(no tables — run `brimz reset` then `brimz seed`)")
        return 0
    with SessionLocal() as session:
        for t in tables:
            if t == "alembic_version":
                continue
            n = session.execute(text(f"SELECT count(*) FROM {t}")).scalar_one()
            print(f"  {t:<28} {n:>7}")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="brimz", description="Brimz DB admin CLI")
    parser.add_argument("--db", help="override DATABASE_URL (informational)", default=None)
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("init", help="create tables if absent").set_defaults(func=cmd_init)
    sub.add_parser("reset", help="drop + recreate all tables").set_defaults(func=cmd_reset)

    p_seed = sub.add_parser("seed", help="load mock + Fitbit fixture data")
    p_seed.add_argument("--reset", action="store_true", help="reset tables before seeding")
    p_seed.add_argument("--attendees", type=int, default=None, help="number of attendee rows")
    p_seed.set_defaults(func=cmd_seed)

    sub.add_parser("validate", help="run integrity + acceptance checks").set_defaults(func=cmd_validate)
    sub.add_parser("status", help="row counts per table").set_defaults(func=cmd_status)

    args = parser.parse_args(argv)
    if args.db:
        print(f"(note: pass DATABASE_URL via env/.env; current: {settings.database_url})")
    try:
        return args.func(args)
    except Exception as exc:  # surface DB connection errors cleanly
        print(f"✗ error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
