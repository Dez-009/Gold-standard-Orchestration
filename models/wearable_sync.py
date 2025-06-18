"""Model storing raw wearable device metrics for contextual insights."""

# Notes: Provide forward annotation compatibility
from __future__ import annotations

# Notes: UUID generation for primary keys
from uuid import uuid4
# Notes: datetime used for timestamp columns
from datetime import datetime

# Notes: SQLAlchemy column types and base class
from sqlalchemy import Column, DateTime, Enum as PgEnum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


from enum import Enum


class WearableDataType(str, Enum):
    """Enumerated types of metrics a wearable might provide."""

    SLEEP = "sleep"
    STEPS = "steps"
    HEARTRATE = "heartrate"


class WearableSyncData(Base):
    """Individual metric record pulled from a wearable device."""

    __tablename__ = "wearable_sync_data"

    # Notes: Primary key using UUID for uniqueness across devices
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: ID of the user owning the wearable data
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Notes: Name of the source integration such as Fitbit or Apple Health
    source = Column(String, nullable=False)
    # Notes: Category of data captured (sleep, steps, etc.)
    data_type = Column(PgEnum(WearableDataType), nullable=False)
    # Notes: Metric value stored as string to support mixed types
    value = Column(String, nullable=False)
    # Notes: When the data point was originally recorded
    recorded_at = Column(DateTime, nullable=False)
    # Notes: Timestamp when the row was created in our system
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the owning user for convenience
    user = relationship("User")

# Footnote: This table enables lightweight storage of health metrics that can be injected into prompts.
