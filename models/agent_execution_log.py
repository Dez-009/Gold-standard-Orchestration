from __future__ import annotations

"""SQLAlchemy model storing execution metrics for each agent call."""

# Notes: uuid4 generates unique identifiers for log rows
from uuid import uuid4

# Notes: datetime for timestamp fields
from datetime import datetime

# Notes: SQLAlchemy column definitions
from sqlalchemy import Column, DateTime, ForeignKey, Boolean, Integer, Text, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentExecutionLog(Base):
    """Record metrics and output of a single agent execution."""

    __tablename__ = "agent_execution_logs"

    # Notes: Primary key for the log entry
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user invoking the agent
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Name of the agent being executed
    agent_name = Column(String, nullable=False)
    # Notes: Input prompt sent to the agent
    input_prompt = Column(Text, nullable=False)
    # Notes: Raw response text returned by the agent
    response_output = Column(Text)
    # Notes: Flag indicating successful completion
    success = Column(Boolean, default=True)
    # Notes: Total execution time in milliseconds
    execution_time_ms = Column(Integer)
    # Notes: Optional error message when execution fails
    error_message = Column(Text, nullable=True)
    # Notes: Timestamp of when this log entry was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user model
    user = relationship("User", back_populates="agent_execution_logs")

# Footnote: This model captures telemetry for each agent run.
