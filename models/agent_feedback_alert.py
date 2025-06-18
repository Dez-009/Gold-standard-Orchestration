from __future__ import annotations

"""SQLAlchemy model capturing alerts for low rated summaries."""

# Notes: uuid4 provides a random identifier for the primary key
from uuid import uuid4
# Notes: datetime is used to timestamp when the alert was created
from datetime import datetime
# Notes: SQLAlchemy column helpers and relationship utilities
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class AgentFeedbackAlert(Base):
    """Record representing a potentially problematic user rating.

    When a user gives an AI generated summary a very low rating, the
    system stores an alert entry so that administrators can manually
    review the content. This helps surface summaries that may contain
    factual errors or problematic advice.
    """

    __tablename__ = "agent_feedback_alert"

    # Notes: Primary key stored as a UUID string
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: User who submitted the low rating
    user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Journal summary that was rated poorly
    summary_id = Column(ForeignKey("journal_summaries.id"), nullable=False)
    # Notes: Numeric rating provided by the user (1-5 scale)
    rating = Column(Integer, nullable=False)
    # Notes: Optional text explaining why the alert was triggered
    flagged_reason = Column(Text, nullable=True)
    # Notes: Timestamp when the alert entry was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Convenience relationship back to the user
    user = relationship("User")
    # Notes: Relationship back to the summary for quick access
    summary = relationship("JournalSummary")

# Footnote: Alerts may later trigger escalation workflows.
