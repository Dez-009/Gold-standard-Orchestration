"""SQLAlchemy model for admin agent assignment overrides."""

from __future__ import annotations

# Notes: Standard imports for timestamps and UUID handling
from datetime import datetime
from uuid import uuid4

# Notes: SQLAlchemy column types and relationship utilities
from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentAssignmentOverride(Base):
    """Represents an override assigning a specific agent to a user."""

    __tablename__ = "agent_assignment_overrides"

    # Notes: Primary key for the override record
    id = Column(Integer, primary_key=True, index=True)
    # Notes: Reference to the user receiving the override
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Identifier of the agent to assign
    agent_id = Column(UUID(as_uuid=True), default=uuid4)
    # Notes: Timestamp the override was created
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Notes: ORM relationship back to the user
    user = relationship("User")
