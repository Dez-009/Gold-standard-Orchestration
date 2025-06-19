from __future__ import annotations

"""SQLAlchemy model representing a user's daily health check-in."""

# Notes: uuid4 used to generate unique identifiers for new records
from uuid import uuid4

# Notes: datetime is used for timestamp default values
from datetime import datetime

# Notes: SQLAlchemy column types and helpers
from sqlalchemy import Column, DateTime, Enum as PgEnum, ForeignKey, Integer, Text
# Notes: PostgreSQL UUID type for storing unique ids
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

# Notes: Python Enum used to define the mood choices
from enum import Enum

from database.base import Base


class Mood(str, Enum):
    """Allowed mood selections for a check-in."""

    EXCELLENT = "EXCELLENT"
    GOOD = "GOOD"
    OKAY = "OKAY"
    STRUGGLING = "STRUGGLING"
    BAD = "BAD"


class DailyCheckIn(Base):
    """Table storing a user's daily health metrics."""

    __tablename__ = "daily_checkins"

    # Notes: Unique identifier for the check-in
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the owning user
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Mood selected from the predefined enum
    mood = Column(PgEnum(Mood, name="mood_enum"), nullable=False)
    # Notes: Numeric energy rating from 1-10
    energy_level = Column(Integer, nullable=False)
    # Notes: Numeric stress rating from 1-10
    stress_level = Column(Integer, nullable=False)
    # Notes: Optional free-form notes for the day
    notes = Column(Text, nullable=True)
    # Notes: Timestamp when the check-in was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user
    user = relationship("User", back_populates="daily_checkins")
