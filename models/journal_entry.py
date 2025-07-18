from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship

from database.base import Base


class JournalEntry(Base):
    """SQLAlchemy model representing a user's journal entry."""

    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    # Optional foreign key linking the journal entry to a specific goal
    linked_goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Indicates whether journal entry was AI-assisted or fully AI-generated
    ai_generated = Column(Boolean, default=False)

    user = relationship("User", back_populates="journal_entries")
    # Convenience relationship to access the linked goal object
    linked_goal = relationship("Goal")

