from __future__ import annotations

"""SQLAlchemy model logging final agent failures after retries.

This log gives administrators visibility into recurring issues with
specific agents and assists with debugging efforts.
"""

# Notes: datetime gives a timestamp for when the failure occurred
# Notes: Use datetime to capture when a failure occurred
from datetime import datetime

# Notes: Import SQLAlchemy column helpers and relationship
from uuid import uuid4

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentFailureLog(Base):
    """Persist details about an agent failure after all retries."""

    __tablename__ = "agent_failure_logs"

    # Notes: Unique identifier for each failure log
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user who experienced the failure
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Name of the failed agent
    agent_name = Column(String, nullable=False)
    # Notes: Description of why the agent ultimately failed
    reason = Column(Text, nullable=False)
    # Notes: Timestamp of when the failure happened
    failed_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user record
    user = relationship("User")

# Footnote: Enables analytics on repeated agent failures.
