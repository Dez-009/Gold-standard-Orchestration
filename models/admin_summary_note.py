from __future__ import annotations

"""ORM model storing timeline notes left by admins on journal summaries."""

from uuid import uuid4
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AdminSummaryNote(Base):
    """Represents a single admin note tied to a summarized journal."""

    __tablename__ = "admin_summary_notes"

    # Notes: Unique id for the note entry
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Foreign key reference to the summary
    summary_id = Column(UUID(as_uuid=True), ForeignKey("summarized_journals.id"))
    # Notes: Admin user that created the note
    author_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Body text for the note
    content = Column(Text, nullable=False)
    # Notes: Time the note was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships back to summary and user
    summary = relationship("SummarizedJournal", back_populates="admin_notes_timeline")
    author = relationship("User")

# Footnote: Enables a persistent note timeline for each journal summary.
