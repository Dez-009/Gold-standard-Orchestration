from __future__ import annotations

"""SQLAlchemy model logging final agent failures after retries."""

# Notes: datetime gives a timestamp for when the failure occurred
from datetime import datetime

# Notes: Import SQLAlchemy column helpers and relationship
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database.base import Base


class AgentFailureLog(Base):
    """Persist details about an agent failure after all retries."""

    __tablename__ = "agent_failure_logs"

    # Notes: Primary key for the log row
    id = Column(Integer, primary_key=True, index=True)
    # Notes: Reference to the user who experienced the failure
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Name of the failed agent
    agent_name = Column(String, nullable=False)
    # Notes: Description of why the agent ultimately failed
    reason = Column(String, nullable=False)
    # Notes: When the failure was recorded
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user record
    user = relationship("User")

# Footnote: Enables analytics on repeated agent failures.
