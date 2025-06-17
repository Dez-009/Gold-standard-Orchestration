"""SQLAlchemy model storing per-user agent personalization."""

from __future__ import annotations

# Notes: uuid4 is used to generate unique primary keys
from uuid import uuid4

# Notes: datetime for timestamp defaults
from datetime import datetime

# Notes: SQLAlchemy columns and types
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class AgentPersonalization(Base):
    """Represents user-specific configuration for an agent."""

    __tablename__ = "agent_personalizations"

    # Notes: Unique identifier for the personalization record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user who owns this profile
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Notes: Name of the agent (e.g. 'career', 'health') being personalized
    agent_name = Column(String, nullable=False)
    # Notes: JSON or text blob containing the personality configuration
    personality_profile = Column(Text, nullable=False)
    # Notes: Timestamp when the profile was created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Timestamp when the profile was last updated
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Footnote: AgentPersonalization records allow persistent storage of custom agent
# behaviours per user, enabling tailored interactions across sessions.
