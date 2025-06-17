"""SQLAlchemy model storing admin on/off toggles for each agent."""

from __future__ import annotations

# Notes: uuid4 for unique identifiers
from uuid import uuid4
# Notes: datetime for timestamp columns
from datetime import datetime

# Notes: SQLAlchemy column helpers
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class AgentToggle(Base):
    """Represents a runtime toggle controlling an agent's availability."""

    __tablename__ = "agent_toggles"

    # Notes: Primary key stored as UUID for portability
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Name of the agent being toggled
    agent_name = Column(String, unique=True, nullable=False)
    # Notes: Flag determining if the agent is enabled
    enabled = Column(Boolean, default=True)
    # Notes: Timestamp when this toggle was first created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Timestamp updated whenever the toggle changes
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Footnote: Allows admins to disable problematic agents at runtime.
