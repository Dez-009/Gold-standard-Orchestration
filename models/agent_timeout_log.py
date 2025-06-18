from __future__ import annotations

"""SQLAlchemy model tracking when an agent exceeds its time limit."""

# Notes: datetime used for timestamp fields
from datetime import datetime

# Notes: SQLAlchemy column types and relationship utility
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database.base import Base


class AgentTimeoutLog(Base):
    """Record of a single agent timeout event."""

    __tablename__ = "agent_timeout_logs"

    # Notes: Primary key identifier for the timeout row
    id = Column(Integer, primary_key=True, index=True)
    # Notes: Reference to the user that triggered the timeout
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Name of the agent that failed to respond in time
    agent_name = Column(String, nullable=False)
    # Notes: Timestamp when the timeout occurred
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user model
    user = relationship("User", back_populates="agent_timeout_logs")

# Footnote: Enables analytics on recurring timeout issues.
