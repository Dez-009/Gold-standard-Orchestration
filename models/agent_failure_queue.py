from __future__ import annotations

"""SQLAlchemy model storing agent failures awaiting retry."""

# Notes: uuid4 for generating unique identifiers
from uuid import uuid4
# Notes: datetime for timestamp fields
from datetime import datetime
# Notes: SQLAlchemy column helpers and UUID type
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentFailureQueue(Base):
    """Represents an agent failure queued for retry."""

    __tablename__ = "agent_failure_queue"

    # Notes: Primary key identifier stored as UUID
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the affected user
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Name of the agent that failed
    agent_name = Column(String, nullable=False)
    # Notes: Text describing why the agent failed
    failure_reason = Column(String, nullable=False)
    # Notes: How many retry attempts have been made
    retry_count = Column(Integer, default=0)
    # Notes: Maximum number of retries before giving up
    max_retries = Column(Integer, default=3)
    # Notes: Record creation timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Last update timestamp
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Notes: Relationship back to the user record
    user = relationship("User")
