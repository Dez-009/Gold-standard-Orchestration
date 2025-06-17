from __future__ import annotations

"""SQLAlchemy model representing a captured analytics event."""

# Notes: Import uuid4 helper for generating unique identifiers
from uuid import uuid4

# Notes: Import datetime for the timestamp default
from datetime import datetime

# Notes: Required SQLAlchemy column types and utilities
from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AnalyticsEvent(Base):
    """Row storing a single user or anonymous analytics event."""

    __tablename__ = "analytics_events"

    # Notes: Primary key stored as a UUID
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Optional reference to the user who triggered the event
    user_id = Column(ForeignKey("users.id"), nullable=True)
    # Notes: Short string categorizing the type of event
    event_type = Column(String, index=True, nullable=False)
    # Notes: JSON payload stored as text for flexible metadata
    event_payload = Column(Text, nullable=False)
    # Notes: Timestamp when the event occurred
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user model when applicable
    user = relationship("User", back_populates="analytics_events")
