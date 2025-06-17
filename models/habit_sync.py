"""Model storing synced wellness metrics from wearables or manual input."""

# Notes: Provide forward annotation compatibility
from __future__ import annotations

# Notes: uuid4 used to create primary keys
from uuid import uuid4
# Notes: datetime object used for timestamp columns
from datetime import datetime
# Notes: Enum type for the source column
from enum import Enum

# Notes: SQLAlchemy helpers for database modeling
from sqlalchemy import Column, DateTime, Enum as PgEnum, ForeignKey, Integer, Float, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class HabitDataSource(str, Enum):
    """Enumerated list of wearable or manual data origins."""

    FITBIT = "fitbit"
    APPLE_HEALTH = "apple_health"
    GOOGLE_FIT = "google_fit"
    MANUAL = "manual"


class HabitSyncData(Base):
    """Single row capturing a day's worth of habit metrics."""

    __tablename__ = "habit_sync_data"

    # Notes: Unique identifier for this record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: User that this data belongs to
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Notes: Where the data originated from (wearable or manual)
    source = Column(PgEnum(HabitDataSource), nullable=False)
    # Notes: Number of steps taken during the day
    steps = Column(Integer, nullable=False)
    # Notes: Hours of sleep recorded for the day
    sleep_hours = Column(Float, nullable=False)
    # Notes: Minutes of moderate to intense activity
    active_minutes = Column(Integer, nullable=False)
    # Notes: Timestamp when the data was synced
    synced_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    # Notes: Record creation timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Timestamp of last update
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Notes: Relationship back to the user for ORM convenience
    user = relationship("User")

# Footnote: Supports tracking basic wellness metrics over time.
