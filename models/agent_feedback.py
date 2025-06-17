from __future__ import annotations

"""SQLAlchemy model capturing user reactions to AI-generated summaries."""

# Notes: uuid4 used for primary keys
from uuid import uuid4
# Notes: datetime for timestamp fields
from datetime import datetime

# Notes: SQLAlchemy column helpers and relationships
from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentFeedback(Base):
    """Table storing emoji reactions and optional text feedback."""

    __tablename__ = "agent_feedback"

    # Notes: Unique identifier for each feedback entry
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Owning user id
    user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Reference to the journal summary this feedback relates to
    summary_id = Column(ForeignKey("journal_summaries.id"), nullable=False)
    # Notes: Optional free text comment from the user
    feedback_text = Column(Text, nullable=True)
    # Notes: Emoji reaction chosen by the user
    emoji_reaction = Column(String, nullable=False)
    # Notes: When the feedback was submitted
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user record
    user = relationship("User")
    # Notes: Relationship back to the summary record
    summary = relationship("JournalSummary")

# Footnote: Additional indexes may be added when analytics scaling is required.
