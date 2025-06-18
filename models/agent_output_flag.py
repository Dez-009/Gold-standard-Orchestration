from __future__ import annotations

"""Model capturing AI outputs that require admin review."""

# Notes: uuid4 generates unique id values
from uuid import uuid4
# Notes: timestamp for creation time
from datetime import datetime

# Notes: SQLAlchemy column definitions
from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentOutputFlag(Base):
    """Persist flagged agent text for moderation workflows."""

    __tablename__ = "agent_output_flags"

    # Notes: Primary key referencing this flag entry
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Name of the agent that produced the output
    agent_name = Column(String, nullable=False)
    # Notes: User associated with the flagged content
    user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Optional link to the summary containing the text
    summary_id = Column(ForeignKey("journal_summaries.id"), nullable=True)
    # Notes: Explanation of why the output was flagged
    reason = Column(Text, nullable=False)
    # Notes: Timestamp when this row was created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Whether an admin has reviewed this flag
    reviewed = Column(Boolean, default=False)

    # Notes: Convenience relationships back to parent models
    user = relationship("User")
    summary = relationship("JournalSummary")

# Footnote: Flags integrate with the content moderation workflow.
