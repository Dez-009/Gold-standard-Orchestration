from __future__ import annotations

"""SQLAlchemy model for storing orchestration audit events."""

# Notes: Import standard datetime helper
from datetime import datetime

# Notes: SQLAlchemy column types and relationship utilities
from sqlalchemy import Column, Integer, String, Text, DateTime

# Notes: Base class for all declarative models
from database.base import Base


class OrchestrationLog(Base):
    """Persist a full record of agent orchestration requests."""

    __tablename__ = "orchestration_logs"

    # Notes: Primary key identifier for the log entry
    id = Column(Integer, primary_key=True, index=True)
    # Notes: When the orchestration was performed
    timestamp = Column(DateTime, default=datetime.utcnow)
    # Notes: ID of the user who made the request
    user_id = Column(Integer, index=True)
    # Notes: The raw prompt provided by the user
    user_prompt = Column(Text, nullable=False)
    # Notes: JSON string listing all agents invoked
    agents_invoked = Column(Text, nullable=False)
    # Notes: JSON string capturing each agent's full response
    full_response = Column(Text, nullable=False)
