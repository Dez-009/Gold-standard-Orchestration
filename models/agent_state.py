from __future__ import annotations

"""SQLAlchemy model storing the latest state of an orchestration agent."""

# Notes: uuid4 is used for the primary key
from uuid import uuid4

# Notes: datetime.utcnow provides timestamp defaults
from datetime import datetime

# Notes: SQLAlchemy column types used for the model
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentState(Base):
    """Represents the current state of an orchestration agent."""

    __tablename__ = "agent_states"

    # Notes: Unique identifier for the agent state row
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user the agent belongs to
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Notes: Agent name such as 'career' or 'health'
    agent_name = Column(String, nullable=False)
    # Notes: Current state string, e.g. 'idle', 'active'
    state = Column(String, nullable=False)
    # Notes: Timestamp when the state was last updated
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Notes: Relationship back to the user model
    user = relationship("User", back_populates="agent_states")
