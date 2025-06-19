from __future__ import annotations

# Notes: Standard library imports for timestamp handling and enums
from datetime import datetime
from enum import Enum

# Notes: SQLAlchemy core imports for table definitions
from sqlalchemy import Column, Integer, ForeignKey, Text, DateTime, Enum as PgEnum
from sqlalchemy.orm import relationship

from database.base import Base


class InsightType(str, Enum):
    """Enumeration of possible sources for an insight."""

    JOURNAL = "journal"
    GOALS = "goals"
    CHECKINS = "checkins"
    OTHER = "other"


class BehavioralInsight(Base):
    """Model storing generated behavioral insights for a user."""

    __tablename__ = "behavioral_insights"

    # Notes: Primary key uniquely identifying each insight
    id = Column(Integer, primary_key=True, index=True)
    # Notes: Foreign key reference to the owning user
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Free form text describing the insight
    insight_text = Column(Text, nullable=False)
    # Notes: Timestamp when the insight was created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Origin category for the insight
    insight_type = Column(PgEnum(InsightType), default=InsightType.JOURNAL)

    # Notes: Relationship back to the user for convenience
    user = relationship("User", back_populates="behavioral_insights")
