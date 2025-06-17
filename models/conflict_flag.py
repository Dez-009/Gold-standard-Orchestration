from __future__ import annotations

"""Model flagging potential conflict issues in journal entries."""

# Notes: Standard imports for uuid generation and timestamps
from uuid import uuid4
from datetime import datetime
from enum import Enum

# Notes: SQLAlchemy column helpers and relationship utilities
from sqlalchemy import Column, DateTime, ForeignKey, Boolean, Text, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class ConflictType(str, Enum):
    """Enumerated categories of interpersonal tension."""

    EMOTIONAL = "emotional"
    RELATIONAL = "relational"
    WORK = "work"
    VALUES = "values"


class ConflictFlag(Base):
    """Row capturing detected conflict within a journal entry."""

    __tablename__ = "conflict_flags"

    # Notes: Primary key identifier for the flag
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the user who wrote the journal
    user_id = Column(ForeignKey("users.id"))
    # Notes: Reference to the journal entry containing the conflict
    journal_id = Column(ForeignKey("journal_entries.id"))
    # Notes: Detected category of conflict
    conflict_type = Column(PgEnum(ConflictType))
    # Notes: Small excerpt of the text that triggered the flag
    summary_excerpt = Column(Text, nullable=False)
    # Notes: Generated coaching prompt or advice
    resolution_prompt = Column(Text, nullable=False)
    # Notes: Whether the user has marked this issue as resolved
    resolved = Column(Boolean, default=False)
    # Notes: Timestamp when the flag was created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Timestamp when the flag was last updated
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Notes: Relationship back to the user record
    user = relationship("User", back_populates="conflict_flags")
    # Notes: Relationship back to the journal entry
    journal = relationship("JournalEntry")

# Footnote: New model enables storing conflict detection results for review.
