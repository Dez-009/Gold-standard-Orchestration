from __future__ import annotations

"""ORM model storing scoring metrics for each agent response."""

# Notes: Utilities for unique identifiers and timestamps
from uuid import uuid4
from datetime import datetime

# Notes: SQLAlchemy column helpers
from sqlalchemy import Column, DateTime, Float, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentScore(Base):
    """Table recording quality scores for an agent output."""

    __tablename__ = "agent_scores"

    # Notes: Primary key for the record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user who received the agent reply
    user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Name of the agent that produced the response
    agent_name = Column(String, nullable=False)
    # Notes: Score representing how complete the response was
    completeness_score = Column(Float, nullable=False)
    # Notes: Score assessing clarity of the response
    clarity_score = Column(Float, nullable=False)
    # Notes: Score indicating topical relevance
    relevance_score = Column(Float, nullable=False)
    # Notes: Timestamp when the scoring entry was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user record
    user = relationship("User", back_populates="agent_scores")

# Footnote: Scores may later be used to train agent models.

