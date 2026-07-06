"""Import all models so SQLAlchemy metadata + Alembic autogenerate see them."""
from brimz.db.models.core import (  # noqa: F401
    Attendee,
    AttendeeSegment,
    Device,
    Event,
    FanSegment,
    Venue,
    Zone,
)
from brimz.db.models.wearable import (  # noqa: F401
    EnergySample,
    EngagementEvent,
    FitbitAccount,
    FitbitActivitySample,
    FitbitHeartrateSample,
    FitbitRawPayload,
    ZoneEngagement,
)
from brimz.db.models.extended import (  # noqa: F401
    AccessRole,
    Alert,
    BillingRecord,
    Campaign,
    CrowdTrigger,
    Emotion,
    Integration,
    RevenueLine,
    Sponsor,
    SponsorROI,
    StaffUser,
    TopMoment,
    Transaction,
    UGCContent,
)

__all__ = [
    "Venue", "Zone", "Event", "FanSegment", "Attendee", "AttendeeSegment", "Device",
    "FitbitAccount", "FitbitRawPayload", "FitbitActivitySample", "FitbitHeartrateSample",
    "EnergySample", "ZoneEngagement", "EngagementEvent",
    "RevenueLine", "Transaction", "Sponsor", "SponsorROI", "Campaign", "UGCContent",
    "Alert", "TopMoment", "Emotion", "CrowdTrigger", "StaffUser", "AccessRole",
    "Integration", "BillingRecord",
]
