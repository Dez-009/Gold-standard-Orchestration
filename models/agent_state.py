from __future__ import annotations

"""SQLAlchemy model storing the latest state of an orchestration agent."""

# Notes: uuid4 is used for the primary key
from uuid import uuid4

# Notes: datetime.utcnow provides timestamp defaults
from datetime import datetime

# Notes: SQLAlchemy column types used for the model
from sqlalchemy import Column, DateTime, Enum as PgEnum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from enum import Enum

from database.base import Base


class AgentStateStatus(str, Enum):
    """Enumeration of allowed agent states."""

    ACTIVE = "active"
    PAUSED = "paused"
    SUSPENDED = "suspended"
    ERROR = "error"
    RETIRED = "retired"


class AgentAccessTier(str, Enum):
    """Role tiers required to run a given agent."""

    free = "free"
    plus = "plus"
    pro = "pro"
    admin = "admin"


class AgentState(Base):
    """Represents the current state of an orchestration agent."""

    __tablename__ = "agent_states"

    # Notes: Unique identifier for the agent state row
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user the agent belongs to
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Notes: Agent name such as 'career' or 'health'
    agent_name = Column(String, nullable=False)
    # Notes: Current lifecycle state for the agent
    state = Column(PgEnum(AgentStateStatus), nullable=False)
    # Notes: Minimum subscription tier required to run this agent
    access_tier = Column(
        PgEnum(AgentAccessTier), default=AgentAccessTier.free, nullable=False
    )
    # Notes: Timestamp when the state was created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Timestamp when the state was last updated
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Notes: Relationship back to the user model
    user = relationship("User", back_populates="agent_states")

# Footnote: Why Do We Need It?
# Notes: Explains why each agent has a corresponding state in the system.
#   - Every agent (career coach, financial coach, mental health coach, etc.)
#     attached to a user has a state.
#   - This state tells the orchestration system if the agent is:
#       active    -> Ready to serve the user
#       paused    -> Temporarily off
#       error     -> Something broke, avoid calling it
#       suspended -> Admin blocked for some reason
#       retired   -> Deprecated agent logic
