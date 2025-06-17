from __future__ import annotations

"""SQLAlchemy model storing AI reflection prompts tied to journal entries."""

# Notes: Standard library helpers for uuid generation and timestamps
from uuid import uuid4
from datetime import datetime

# Notes: SQLAlchemy column and relationship utilities
from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

# Notes: Import the declarative base class
from database.base import Base


class ReflectionPrompt(Base):
    """Follow-up questions generated to deepen user reflection."""

    __tablename__ = "reflection_prompts"

    # Notes: Primary key unique identifier for the prompt
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Owning user the prompt was generated for
    user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Journal entry associated with this prompt
    journal_id = Column(ForeignKey("journal_entries.id"), nullable=False)
    # Notes: Text of the question or reflection prompt
    prompt_text = Column(Text, nullable=False)
    # Notes: Timestamp when the prompt was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user object
    user = relationship("User")
    # Notes: Relationship back to the journal entry
    journal = relationship("JournalEntry")

    def __repr__(self) -> str:
        """Return debug representation including id and user."""

        return f"<ReflectionPrompt id={self.id} user_id={self.user_id}>"

# Footnote: Prompts are stored so the frontend can encourage deeper journaling.
