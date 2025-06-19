from __future__ import annotations

"""SQLAlchemy model storing AI-derived journal trend insights."""

# Notes: Import helper for generating unique identifiers
from uuid import uuid4

# Notes: Datetime utilities for timestamp fields
from datetime import datetime

# Notes: SQLAlchemy column and relationship helpers
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
# Notes: Postgres UUID type to store the id
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class JournalTrend(Base):
    """Persisted analysis of journal entry trends for a user."""

    __tablename__ = "journal_trends"

    # Notes: Primary key for the trend record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to owning user
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Time when the trend analysis was created
    timestamp = Column(DateTime, default=datetime.utcnow)
    # Notes: JSON or text summary of mood sentiment over time
    mood_summary = Column(Text, nullable=False)
    # Notes: JSON string capturing keyword frequency information
    keyword_trends = Column(Text, nullable=False)
    # Notes: Narrative notes about goal progress patterns
    goal_progress_notes = Column(Text, nullable=False)

    # Notes: Relationship back to the user model
    user = relationship("User", back_populates="journal_trends")
