from __future__ import annotations

"""SQLAlchemy model capturing each agent conversation."""

# Notes: Standard library import for timestamps
from datetime import datetime

# Notes: SQLAlchemy column and relationship helpers
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

# Notes: Base class for declarative models
from database.base import Base


class AgentInteractionLog(Base):
    """Persist user prompts and AI responses."""

    __tablename__ = "agent_interaction_logs"

    # Notes: Primary key identifier for the log entry
    id = Column(Integer, primary_key=True, index=True)
    # Notes: Owning user for this interaction
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Raw text of the user's prompt
    user_prompt = Column(Text, nullable=False)
    # Notes: Text returned by the agent
    ai_response = Column(Text, nullable=False)
    # Notes: Timestamp when the exchange occurred
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user
    user = relationship("User", back_populates="interaction_logs")
