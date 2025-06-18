from __future__ import annotations

"""SQLAlchemy models for capturing orchestration history and performance.

These tables allow the system to audit multi-agent runs and measure
latency as well as token usage.  Capturing this telemetry helps
developers tune prompts and identify bottlenecks in the orchestration
pipeline."""

# Notes: Import standard datetime helper
from datetime import datetime

# Notes: SQLAlchemy column types and relationship utilities
from uuid import uuid4

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID

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


class OrchestrationPerformanceLog(Base):
    """Track performance metrics for each orchestration run.

    The override fields capture when an administrator manually triggers
    an agent execution outside the normal flow.  This helps maintain
    an audit trail of interventions.
    """

    __tablename__ = "orchestration_performance_logs"

    # Notes: Unique identifier for the performance entry
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Name of the agent orchestrated (e.g. JournalSummarizationAgent)
    agent_name = Column(String, nullable=False)
    # Notes: Reference to the user who triggered the orchestration
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Total time taken for the orchestration in milliseconds
    execution_time_ms = Column(Integer)
    # Notes: Count of tokens sent to the language model
    input_tokens = Column(Integer)
    # Notes: Count of tokens received from the language model
    output_tokens = Column(Integer)
    # Notes: Result status such as 'success', 'failed', or 'timeout'
    status = Column(String)
    # Notes: True if fallback logic had to be executed
    fallback_triggered = Column(Boolean, default=False)
    # Notes: True when execution exceeded the configured timeout
    timeout_occurred = Column(Boolean, default=False)
    # Notes: Number of retry attempts made for this run
    retries = Column(Integer, default=0)
    # Notes: Optional message describing the last encountered error
    error_message = Column(Text, nullable=True)
    # Notes: Version label of the prompt template used for this run
    prompt_version = Column(String, nullable=True)
    # Notes: Flag denoting when an admin manually re-ran the agent
    override_triggered = Column(Boolean, default=False)
    # Notes: Optional free form text describing why the override occurred
    override_reason = Column(Text, nullable=True)
    # Notes: When the orchestration completed
    timestamp = Column(DateTime, default=datetime.utcnow)
