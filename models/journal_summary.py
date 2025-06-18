from __future__ import annotations

"""SQLAlchemy model storing AI-generated journal summaries."""

# Notes: uuid4 used for generating unique identifiers
from uuid import uuid4

# Notes: datetime for timestamp fields
from datetime import datetime

# Notes: SQLAlchemy column types and relationship helpers
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, Boolean
# Notes: PostgreSQL UUID type for id columns
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class JournalSummary(Base):
    """Persisted summary generated from a group of journal entries."""

    __tablename__ = "journal_summaries"

    # Notes: Primary key for the summary record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user the summary belongs to
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Time when the summary was created
    timestamp = Column(DateTime, default=datetime.utcnow)
    # Notes: Text produced by the AI summarization model
    summary_text = Column(Text, nullable=False)
    # Notes: JSON string of journal entry ids used for the summary
    source_entry_ids = Column(Text, nullable=False)
    # Notes: Mark when this summary has been flagged
    flagged = Column(Boolean, default=False)
    # Notes: Reason provided for the flag
    flag_reason = Column(Text, nullable=True)
    # Notes: Time when the flag was recorded
    flagged_at = Column(DateTime, nullable=True)

    # Notes: Relationship back to the owning user
    user = relationship("User", back_populates="journal_summaries")
