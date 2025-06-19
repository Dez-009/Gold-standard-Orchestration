from __future__ import annotations

"""SQLAlchemy model capturing churn prediction scores for users."""

# Notes: uuid4 for id generation and datetime for timestamp fields
from uuid import uuid4
from datetime import datetime

# Notes: SQLAlchemy helpers for columns and datatypes
from sqlalchemy import Column, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class ChurnScore(Base):
    """Persisted churn prediction output for a user."""

    __tablename__ = "churn_scores"

    # Notes: Primary key stored as UUID for consistency
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Link back to the user the score applies to
    user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Floating point risk in range 0 to 1
    churn_risk = Column(Float, nullable=False)
    # Notes: Timestamp for when the score was generated
    calculated_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Optional JSON explanation stored as text
    reasons = Column(Text, nullable=True)

    # Notes: Relationship to the User model for easy access
    user = relationship("User")
