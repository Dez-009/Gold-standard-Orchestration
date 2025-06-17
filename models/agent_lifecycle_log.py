from __future__ import annotations

"""SQLAlchemy model tracking the lifecycle of orchestration agents."""

# Notes: uuid4 is used for generating unique identifiers
from uuid import uuid4

# Notes: datetime.utcnow provides default timestamp values
from datetime import datetime

# Notes: Column helpers used by SQLAlchemy ORM
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
# Notes: Postgres UUID type for the primary key
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentLifecycleLog(Base):
    """Record each significant event for an agent instance."""

    __tablename__ = "agent_lifecycle_logs"

    # Notes: Unique identifier for the log entry
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user that triggered the event
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Name of the agent involved in the event
    agent_name = Column(String, nullable=False)
    # Notes: Type of event such as 'started' or 'completed'
    event_type = Column(String, nullable=False)
    # Notes: Time the event occurred
    timestamp = Column(DateTime, default=datetime.utcnow)
    # Notes: Optional JSON payload with request/response details
    details = Column(Text)

    # Notes: Relationship back to the user
    user = relationship("User", back_populates="agent_lifecycle_logs")
