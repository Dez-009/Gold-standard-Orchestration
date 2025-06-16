from __future__ import annotations

"""SQLAlchemy model for storing system-level metrics."""

# Notes: Import uuid4 for generating unique identifiers
from uuid import uuid4
# Notes: datetime used for timestamp default
from datetime import datetime

# Notes: SQLAlchemy column and type definitions
from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID

# Notes: Base declarative class
from database.base import Base


class SystemMetric(Base):
    """Represents a snapshot of a collected system metric."""

    __tablename__ = "system_metrics"

    # Notes: Primary key stored as UUID string for uniqueness across systems
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Name identifying the metric, e.g. 'api_calls'
    metric_name = Column(String, index=True)
    # Notes: Numeric value recorded for this metric
    metric_value = Column(Float)
    # Notes: When the metric was recorded
    recorded_at = Column(DateTime, default=datetime.utcnow)
