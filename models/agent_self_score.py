from __future__ import annotations

"""ORM model storing self-reported confidence scores for summaries."""

# Notes: Standard utilities for unique ids and timestamps
from uuid import uuid4
from datetime import datetime

# Notes: SQLAlchemy column definitions and helpers
from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentSelfScore(Base):
    """Tracks how confident an agent was about a generated summary."""

    __tablename__ = "agent_self_scores"

    # Notes: Primary key for the self score record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Name of the agent providing the score
    agent_name = Column(String, nullable=False)
    # Notes: Link to the summary being evaluated
    summary_id = Column(UUID(as_uuid=True), ForeignKey("summarized_journals.id"))
    # Notes: Reference to the user who owns the summary
    user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Normalized score from 0.0 to 1.0 representing confidence
    self_score = Column(Float, nullable=False)
    # Notes: Optional free-form reasoning provided by the agent
    reasoning = Column(Text, nullable=True)
    # Notes: Timestamp when the agent submitted the score
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the summary record
    summary = relationship("SummarizedJournal", back_populates="self_scores")
    # Notes: Relationship back to the owning user
    user = relationship("User")

# Footnote: Used by analytics to gauge agent perceived accuracy over time.
