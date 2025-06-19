from __future__ import annotations

"""SQLAlchemy model representing calculated churn risk scores."""

# Notes: Standard library imports for timestamps and uuid
from uuid import uuid4
from datetime import datetime
from enum import Enum

# Notes: SQLAlchemy column helpers and types
from sqlalchemy import Column, DateTime, Enum as PgEnum, ForeignKey, Float, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class RiskCategory(str, Enum):
    """Categorical risk levels derived from the score."""

    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class ChurnRisk(Base):
    """Persisted churn risk record for a user."""

    __tablename__ = "churn_risks"

    # Notes: Unique identifier using UUID for simplicity
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Link back to the user that the risk was calculated for
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Notes: Decimal score in range 0-1 with higher meaning greater risk
    risk_score = Column(Float, nullable=False)
    # Notes: Text category computed from the score for quick filtering
    risk_category = Column(PgEnum(RiskCategory), nullable=False)
    # Notes: Timestamp when the score was generated
    calculated_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user object
    user = relationship("User")
