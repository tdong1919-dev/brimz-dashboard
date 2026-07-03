"""Deterministic mock-data generator (Milestone 1).

Mirrors the headline figures from the dashboard's `mockData.ts` and generates
plausible detail rows (attendees, wearable samples) beneath them. Seeded for
reproducibility so demos and tests are stable.
"""
from __future__ import annotations

import random
from datetime import date, datetime, time, timedelta, timezone

from faker import Faker
from sqlalchemy.orm import Session

from brimz.config import settings
from brimz.db.models import (
    AccessRole,
    Alert,
    Attendee,
    AttendeeSegment,
    BillingRecord,
    Campaign,
    CrowdTrigger,
    Device,
    Emotion,
    EnergySample,
    EngagementEvent,
    Event,
    FanSegment,
    FitbitAccount,
    Integration,
    RevenueLine,
    Sponsor,
    SponsorROI,
    StaffUser,
    TopMoment,
    Transaction,
    UGCContent,
    Venue,
    Zone,
    ZoneEngagement,
)
from brimz.seed.fitbit_loader import ingest_account_day

SEED = 42
CHAMPIONSHIP_DAY = date(2026, 6, 15)

# ── Source figures mirrored from src/data/mockData.ts ────────────────────────
ZONES = [
    ("Floor / GA", 4800, 92, 18, 98),
    ("Lower Bowl – Center", 8200, 85, 12, 96),
    ("Lower Bowl – Ends", 6400, 68, 5, 89),
    ("Club Level", 3600, 74, 8, 92),
    ("Upper Bowl – Center", 10800, 55, -3, 81),
    ("Upper Bowl – Ends", 8200, 46, -7, 74),
]

EVENTS = [
    ("Championship Night", date(2026, 6, 15), "Upcoming", 48672),
    ("NFL Playoff Game", date(2026, 6, 22), "Upcoming", 36400),
    ("NBA Finals Watch", date(2026, 7, 4), "Planning", 28900),
    ("College Bowl Game", date(2026, 7, 19), "Planning", 22100),
    ("All-Star Weekend", date(2026, 8, 2), "Draft", 18000),
]

# (hour, minute, energy, label)
ENERGY_TIMELINE = [
    (18, 0, 18000, "Doors Open"), (18, 30, 31000, ""), (19, 0, 48000, "Opening Act"),
    (19, 30, 62000, ""), (20, 0, 79000, "Headliner"), (20, 24, 98000, "PEAK"),
    (20, 30, 84000, ""), (21, 0, 71000, ""), (21, 30, 66000, ""), (22, 0, 72000, ""),
    (22, 15, 89000, "Encore"), (22, 30, 74000, ""), (23, 0, 38000, ""),
]

# (hour, minute, polls, challenges, rewards, shares)
ENGAGEMENT_TIMELINE = [
    (18, 0, 800, 400, 200, 100), (19, 0, 2400, 1600, 900, 600),
    (20, 0, 5200, 3400, 2100, 1400), (20, 30, 8400, 5800, 3800, 2200),
    (21, 0, 11200, 7800, 5400, 3100), (22, 0, 14800, 9800, 7200, 4400),
    (23, 0, 18600, 12300, 9700, 6200),
]

EMOTIONS = [("Excited", 42), ("Happy", 21), ("Hyped", 15), ("Joyful", 12), ("Other", 10)]
EMOTION_DRIVERS = [
    ("Artist Performance", 48), ("Pyro / Visual Effects", 22),
    ("Crowd Interaction", 15), ("Surprise Guest", 10), ("Giveaways / Rewards", 5),
]

FAN_SEGMENTS = [
    ("Season Ticket Holders", 4200, 420, 18.2, 94),
    ("VIP Suite Members", 1240, 680, 12.4, 97),
    ("High Engagers", 8800, 180, 6.1, 88),
    ("Returning Fans", 18200, 142, 3.8, 76),
    ("First-Timers", 16232, 98, 1.0, 62),
]

AGE_BANDS = [("17–17", 2), ("18–24", 28), ("25–34", 34), ("35–44", 18), ("45–54", 8), ("55+", 4)]
GENDERS = [("Male", 52), ("Female", 45), ("Non-binary/Other", 3)]
LOCATIONS = [("City A", 42), ("City B", 18), ("City C", 12), ("City D", 8), ("Other", 20)]

DEVICES = [
    ("WB-001", "Floor / GA", 87, "Online", 1240),
    ("WB-002", "Lower Bowl – Center", 72, "Online", 890),
    ("WB-003", "Lower Bowl – Ends", 65, "Online", 920),
    ("WB-004", "Club Level", 91, "Online", 380),
    ("WB-005", "Upper Bowl – Center", 43, "Warning", 1820),
    ("WB-B7", "Lower Bowl – Ends", 0, "Offline", 0),
]

REVENUE_BREAKDOWN = [
    ("Ticketing", 1450000, 58), ("Concessions", 620000, 25),
    ("Merchandise", 280000, 11), ("Sponsorship", 130000, 5),
]

SPONSORS = [
    ("Nike", "Platinum", 2400000, 184000, 42000, 8200, 3.40),
    ("Red Bull", "Platinum", 1800000, 142000, 31000, 6100, 2.90),
    ("Samsung", "Gold", 1200000, 98000, 22000, 4400, 2.10),
    ("Spotify", "Gold", 980000, 76000, 18000, 3200, 1.80),
    ("Pepsi", "Silver", 720000, 54000, 12000, 2100, 1.40),
]

CAMPAIGNS = [
    ("Season Ticket Loyalty Rewards", "Retention", "Active", 12400, 34, 8.2),
    ("VIP Suite Upgrade Offer", "Upsell", "Active", 3200, 41, 12.1),
    ("Nike x Brimz Fan Challenge", "Sponsor", "Active", 8700, 28, 5.4),
    ("Early Bird Pre-Sale", "Acquisition", "Scheduled", None, None, None),
    ("Post-Game Recap Push", "Engagement", "Draft", None, None, None),
]

UGC = [
    ("Video", "Instagram", 4200, 28400, "#BrimzFest", 10),
    ("Photo", "TikTok", 8900, 142000, "#BrimzVibes", 22),
    ("Story", "Instagram", 2100, 18200, "#LiveMoreBrimz", 45),
    ("Reel", "TikTok", 12400, 210000, "#BrimzEnergy", 60),
    ("Tweet", "Twitter/X", 680, 4200, "#Brimz", 60),
]

ALERTS = [
    ("warning", "Crowd density spike", "Floor GA at 103% capacity", "Floor / GA", 2),
    ("error", "Device offline", "Wristband hub B7 disconnected", "Lower Bowl – Ends", 8),
    ("info", "Peak engagement reached", "Engagement score hit 94.2 — new record", None, 14),
    ("warning", "Security flag", "Unauthorized access attempt at Gate 4", None, 21),
    ("info", "Sponsor activation live", "Nike LED wall activated in VIP Terrace", "Club Level", 35),
]

TOP_MOMENTS = [
    (1, 'Encore – Song: "Thunder"', (20, 24), 98000),
    (2, "Pyro Show", (20, 5), 91000),
    (3, "Surprise Guest", (20, 47), 87000),
    (4, "Crowd Sing Along", (19, 32), 76000),
    (5, "Confetti Drop", (22, 16), 72000),
]

CROWD_TRIGGERS = [
    "Pyro / Visuals", "Surprise Guest", "High Energy", "Crowd Interaction",
    "Song Choice", "Giveaways", "Special Effects",
]

INTEGRATIONS = [
    ("Fitbit", "Wearables", "Available", False),
    ("Stripe", "Payments", "Connected", True),
    ("Mailchimp", "Marketing", "Available", False),
    ("Salesforce", "CRM", "Available", False),
    ("Ticketmaster", "Ticketing", "Connected", True),
]


def _dt(day: date, hh: int, mm: int) -> datetime:
    return datetime.combine(day, time(hh, mm), tzinfo=timezone.utc)


def _weighted(rng: random.Random, options: list[tuple[str, int]]) -> str:
    labels = [o[0] for o in options]
    weights = [o[1] for o in options]
    return rng.choices(labels, weights=weights, k=1)[0]


def seed_all(session: Session, n_attendees: int | None = None) -> dict[str, int]:
    """Populate the database. Assumes tables exist and are empty. Returns row counts."""
    n_attendees = n_attendees if n_attendees is not None else settings.seed_attendees
    Faker.seed(SEED)
    fake = Faker()
    rng = random.Random(SEED)
    counts: dict[str, int] = {}

    # ── Venue + zones ────────────────────────────────────────────────────────
    venue = Venue(
        slug="main-arena", name="Main Arena", city="City A", capacity=42000,
        timezone="America/New_York", brand_primary_color="#f59e0b",
    )
    session.add(venue)
    session.flush()

    zones: dict[str, Zone] = {}
    for name, cap, *_ in ZONES:
        z = Zone(venue_id=venue.id, name=name, capacity=cap)
        session.add(z)
        zones[name] = z
    session.flush()
    counts["zones"] = len(zones)

    # ── Events ───────────────────────────────────────────────────────────────
    events: list[Event] = []
    for name, edate, status, attendance in EVENTS:
        e = Event(venue_id=venue.id, name=name, event_date=edate, status=status, attendance=attendance)
        session.add(e)
        events.append(e)
    session.flush()
    championship = events[0]
    counts["events"] = len(events)

    # ── Fan segments ─────────────────────────────────────────────────────────
    segments: list[tuple[FanSegment, int]] = []
    for name, count, spend, visits, engagement in FAN_SEGMENTS:
        s = FanSegment(name=name, avg_spend=spend, avg_visits=visits, engagement=engagement)
        session.add(s)
        segments.append((s, count))
    session.flush()
    counts["fan_segments"] = len(segments)
    seg_objs = [s for s, _ in segments]
    seg_weights = [c for _, c in segments]

    # ── Attendees (with demographics) + segment membership ───────────────────
    for i in range(n_attendees):
        att = Attendee(
            external_ref=f"ATT-{i:06d}",
            age_band=_weighted(rng, AGE_BANDS),
            gender=_weighted(rng, GENDERS),
            home_city=_weighted(rng, LOCATIONS),
            is_returning=rng.random() < 0.62,
        )
        session.add(att)
        session.flush()
        seg = rng.choices(seg_objs, weights=seg_weights, k=1)[0]
        session.add(AttendeeSegment(attendee_id=att.id, segment_id=seg.id))
    counts["attendees"] = n_attendees

    # ── Devices ──────────────────────────────────────────────────────────────
    for code, zone_name, battery, status, connected in DEVICES:
        z = zones.get(zone_name)
        session.add(Device(
            code=code, venue_id=venue.id, zone_id=z.id if z else None,
            type="Wristband Hub", battery=battery, status=status, connected_count=connected,
        ))
    counts["devices"] = len(DEVICES)

    # ── Energy timeline (championship) ───────────────────────────────────────
    # Venue-wide curve (zone_id=None) — the headline energy timeline.
    for hh, mm, energy, label in ENERGY_TIMELINE:
        session.add(EnergySample(
            event_id=championship.id, zone_id=None, ts=_dt(CHAMPIONSHIP_DAY, hh, mm),
            label=label or None, energy_value=energy,
        ))
    # Per-zone curves (zone_id set) — SIMULATION: lets the live view show each
    # section "active in the moment" with its own intensity. Scaled by the zone's
    # engagement score + jitter so sections peak differently. The playback engine
    # (M2) will replay these on a wall-clock; real per-fan data arrives in M4.
    avg_score = sum(z[2] for z in ZONES) / len(ZONES)
    zone_ts_rows = 0
    for name, cap, score, vs_avg, filled in ZONES:
        factor = score / avg_score
        for hh, mm, energy, label in ENERGY_TIMELINE:
            val = int(energy * factor * rng.uniform(0.9, 1.1))
            session.add(EnergySample(
                event_id=championship.id, zone_id=zones[name].id,
                ts=_dt(CHAMPIONSHIP_DAY, hh, mm), label=None, energy_value=val,
            ))
            zone_ts_rows += 1
    counts["energy_samples"] = len(ENERGY_TIMELINE) + zone_ts_rows

    # ── Zone engagement (championship) ───────────────────────────────────────
    for name, cap, score, vs_avg, filled in ZONES:
        session.add(ZoneEngagement(
            event_id=championship.id, zone_id=zones[name].id,
            score=score, vs_avg=vs_avg, filled_pct=filled,
        ))
    counts["zone_engagement"] = len(ZONES)

    # ── Engagement events (championship) ─────────────────────────────────────
    eng_rows = 0
    for hh, mm, polls, challenges, rewards, shares in ENGAGEMENT_TIMELINE:
        ts = _dt(CHAMPIONSHIP_DAY, hh, mm)
        for etype, count in (("poll", polls), ("challenge", challenges), ("reward", rewards), ("share", shares)):
            session.add(EngagementEvent(event_id=championship.id, ts=ts, type=etype, count=count))
            eng_rows += 1
    counts["engagement_events"] = eng_rows

    # ── Emotions + drivers ───────────────────────────────────────────────────
    for label, pct in EMOTIONS:
        session.add(Emotion(event_id=championship.id, kind="emotion", label=label, pct=pct))
    for label, pct in EMOTION_DRIVERS:
        session.add(Emotion(event_id=championship.id, kind="driver", label=label, pct=pct))
    counts["emotions"] = len(EMOTIONS) + len(EMOTION_DRIVERS)

    # ── Revenue lines + sample transactions ──────────────────────────────────
    for category, amount, pct in REVENUE_BREAKDOWN:
        session.add(RevenueLine(event_id=championship.id, category=category, amount=amount, pct=pct))
    counts["revenue_lines"] = len(REVENUE_BREAKDOWN)

    tx_rows = 0
    for _ in range(200):
        session.add(Transaction(
            event_id=championship.id,
            amount=round(rng.uniform(15, 320), 2),
            kind=rng.choice(["Ticketing", "Concessions", "Merchandise"]),
            ts=_dt(CHAMPIONSHIP_DAY, rng.randint(18, 23), rng.randint(0, 59)),
        ))
        tx_rows += 1
    counts["transactions"] = tx_rows

    # ── Sponsors + ROI ───────────────────────────────────────────────────────
    for name, tier, impr, eng, clicks, conv, roi in SPONSORS:
        sp = Sponsor(name=name, tier=tier)
        session.add(sp)
        session.flush()
        session.add(SponsorROI(
            sponsor_id=sp.id, event_id=championship.id, impressions=impr,
            engagements=eng, clicks=clicks, conversions=conv, roi=roi,
        ))
    counts["sponsors"] = len(SPONSORS)

    # ── Campaigns ────────────────────────────────────────────────────────────
    for name, ctype, status, reach, eng, conv in CAMPAIGNS:
        session.add(Campaign(
            name=name, type=ctype, status=status, reach=reach,
            engagement_pct=eng, conversion_pct=conv,
        ))
    counts["campaigns"] = len(CAMPAIGNS)

    # ── UGC ──────────────────────────────────────────────────────────────────
    base = _dt(CHAMPIONSHIP_DAY, 23, 0)
    for ctype, platform, shares, likes, hashtag, mins_ago in UGC:
        session.add(UGCContent(
            event_id=championship.id, type=ctype, platform=platform, shares=shares,
            likes=likes, hashtag=hashtag, posted_at=base - timedelta(minutes=mins_ago),
        ))
    counts["ugc_content"] = len(UGC)

    # ── Alerts ───────────────────────────────────────────────────────────────
    for level, title, message, zone_name, mins_ago in ALERTS:
        z = zones.get(zone_name) if zone_name else None
        session.add(Alert(
            event_id=championship.id, zone_id=z.id if z else None, level=level,
            title=title, message=message, created_at=base - timedelta(minutes=mins_ago),
        ))
    counts["alerts"] = len(ALERTS)

    # ── Top moments ──────────────────────────────────────────────────────────
    for rank, label, (hh, mm), energy in TOP_MOMENTS:
        session.add(TopMoment(
            event_id=championship.id, rank=rank, label=label,
            occurred_at=_dt(CHAMPIONSHIP_DAY, hh, mm), energy=energy,
        ))
    counts["top_moments"] = len(TOP_MOMENTS)

    # ── Crowd triggers ───────────────────────────────────────────────────────
    for name in CROWD_TRIGGERS:
        session.add(CrowdTrigger(name=name))
    counts["crowd_triggers"] = len(CROWD_TRIGGERS)

    # ── Staff + roles ────────────────────────────────────────────────────────
    roles = [
        ("Admin", "Full access to all settings and data"),
        ("Manager", "Manage events and view all analytics"),
        ("Viewer", "Read-only dashboard access"),
    ]
    for name, desc in roles:
        session.add(AccessRole(name=name, description=desc))
    # M3: demo logins — one per role, passwords from settings (printed by `brimz seed`).
    from brimz.api.security import hash_password

    staff = [
        ("owner@brimz.tech", "Bennie B.", "Admin", settings.seed_admin_password),
        ("ops@brimz.tech", "Ops Manager", "Manager", settings.seed_manager_password),
        ("analyst@brimz.tech", "Data Analyst", "Viewer", settings.seed_viewer_password),
    ]
    for email, name, role, password in staff:
        session.add(StaffUser(
            email=email, name=name, role=role, is_active=True,
            password_hash=hash_password(password),
        ))
    counts["access_roles"] = len(roles)
    counts["staff_users"] = len(staff)

    # ── Integrations + billing ───────────────────────────────────────────────
    for name, category, status, connected in INTEGRATIONS:
        session.add(Integration(name=name, category=category, status=status, connected=connected))
    counts["integrations"] = len(INTEGRATIONS)

    billing = [
        ("Brimz Platform — Monthly", 2500.00, "Paid", "2026-05"),
        ("Brimz Platform — Monthly", 2500.00, "Paid", "2026-06"),
        ("Overage — Extra devices", 340.00, "Pending", "2026-06"),
    ]
    for desc, amount, status, period in billing:
        session.add(BillingRecord(
            description=desc, amount=amount, status=status, period=period,
            created_at=_dt(date(int(period[:4]), int(period[5:7]), 1), 0, 0),
        ))
    counts["billing_records"] = len(billing)

    # ── Fitbit accounts + wearable ingestion (raw JSONB → normalized) ────────
    # SIMULATION model: account #0 is the "real" template user (e.g. the CEO's
    # Fitbit) ingested verbatim; the rest are amplified copies with per-account
    # variation, so one real signal fills a stadium. Raw JSONB is always the real
    # template; only normalized samples are perturbed. M4 swaps in real per-fan data.
    fitbit_attendees = session.query(Attendee).order_by(Attendee.id).limit(min(40, n_attendees)).all()
    fetched_at = _dt(date(2026, 6, 16), 9, 0)
    act_total = hr_total = 0
    for i, att in enumerate(fitbit_attendees):
        is_template = i == 0
        acct = FitbitAccount(
            attendee_id=att.id,
            fitbit_user_id="REAL-TEMPLATE" if is_template else f"SIM{i:05d}",
            scopes="activity heartrate",
        )
        session.add(acct)
        session.flush()
        # Template user: no variation. Simulated fans: scaled + jittered.
        scale = 1.0 if is_template else rng.uniform(0.85, 1.15)
        jitter = 0 if is_template else 6
        a, h = ingest_account_day(
            session, acct, championship, CHAMPIONSHIP_DAY, fetched_at,
            hr_scale=scale, hr_jitter=jitter, rng=rng,
        )
        act_total += a
        hr_total += h
    counts["fitbit_accounts"] = len(fitbit_attendees)
    counts["fitbit_activity_samples"] = act_total
    counts["fitbit_heartrate_samples"] = hr_total
    counts["fitbit_raw_payloads"] = len(fitbit_attendees) * 2

    session.commit()
    return counts
