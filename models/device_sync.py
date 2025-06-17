"""Model storing logs of wearable device synchronization events."""

# Notes: uuid4 creates unique identifiers for each sync record
from uuid import uuid4
# Notes: datetime used for timestamp fields
from datetime import datetime

# Notes: SQLAlchemy core imports
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class DeviceSyncLog(Base):
    """Record a single synchronization event from a wearable device."""

    __tablename__ = "device_sync_logs"

    # Notes: Primary key referencing this sync log
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: ID of the user whose device generated the event
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Notes: Name of the data source such as Fitbit or AppleHealth
    source = Column(String, nullable=False)
    # Notes: Time when the sync occurred on the device
    synced_at = Column(DateTime, nullable=False)
    # Notes: Status of the sync process (success, failed, pending)
    sync_status = Column(String, nullable=False)
    # Notes: Preview of raw payload captured during the sync
    raw_data_preview = Column(JSON, nullable=True)
    # Notes: Creation timestamp for this log entry
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user owning this device
    user = relationship("User")

# Footnote: Allows auditing of data coming from wearable integrations.
