"""Model capturing results of wearable data synchronization attempts."""

# Notes: Enable forward annotations for Python 3.10+
from __future__ import annotations

# Notes: Helpers for unique identifiers and timestamps
from uuid import uuid4
from datetime import datetime

# Notes: SQLAlchemy column types and base model
from sqlalchemy import Column, DateTime, Enum as PgEnum, ForeignKey, String, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base

# Notes: Python enum used for valid sync statuses
from enum import Enum


class SyncStatus(str, Enum):
    """Enumeration of possible outcomes for a sync event."""

    SUCCESS = "success"
    PARTIAL = "partial"
    ERROR = "error"


class WearableSyncLog(Base):
    """Record summarizing a single wearable synchronization run."""

    __tablename__ = "wearable_sync_logs"

    # Notes: Primary key unique identifier for this log entry
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: User who initiated the sync attempt
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Notes: Type of wearable device (e.g. fitbit, oura)
    device_type = Column(String, nullable=False)
    # Notes: Resulting status value from the sync
    sync_status = Column(PgEnum(SyncStatus), nullable=False)
    # Notes: When the sync occurred
    synced_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Optional link to the raw data captured during sync
    raw_data_url = Column(String, nullable=True)

    # Notes: Relationship object back to the associated User record
    user = relationship("User")

# Footnote: This table lets administrators audit ingestion from wearables.
