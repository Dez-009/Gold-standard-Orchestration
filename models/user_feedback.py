from __future__ import annotations

"""SQLAlchemy model representing user submitted feedback."""

# Notes: uuid4 used for unique identifiers
from uuid import uuid4
# Notes: Datetime for automatic timestamping
from datetime import datetime
# Notes: SQLAlchemy column helpers
from sqlalchemy import Column, DateTime, Enum as PgEnum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
# Notes: Enum used to define feedback categories
from enum import Enum

from database.base import Base


class FeedbackType(str, Enum):
    """Allowed categories for feedback submissions."""

    BUG = "Bug"
    FEATURE_REQUEST = "Feature Request"
    PRAISE = "Praise"
    COMPLAINT = "Complaint"
    OTHER = "Other"


class UserFeedback(Base):
    """Table storing feedback messages from users."""

    __tablename__ = "user_feedback"

    # Notes: Unique identifier for the feedback record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Optional reference to the submitting user
    user_id = Column(ForeignKey("users.id"), nullable=True)
    # Notes: Category of the feedback selected by the user
    feedback_type = Column(PgEnum(FeedbackType), nullable=False)
    # Notes: Feedback message content
    message = Column(Text, nullable=False)
    # Notes: Timestamp when the feedback was created
    submitted_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user object
    user = relationship("User")
