from __future__ import annotations

"""SQLAlchemy model mapping a user to an AI agent."""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database.base import Base


class AgentAssignment(Base):
    """Represents an AI agent assigned to a user."""

    __tablename__ = "agent_assignments"

    # Primary key identifier for the assignment record
    id = Column(Integer, primary_key=True, index=True)
    # Link back to the user receiving the agent
    user_id = Column(Integer, ForeignKey("users.id"))
    # Name of the agent or coaching domain
    agent_type = Column(String, nullable=False)
    # Timestamp when the assignment occurred
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to the owning user
    user = relationship("User", back_populates="agent_assignments")

