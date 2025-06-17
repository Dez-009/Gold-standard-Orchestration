from __future__ import annotations

"""SQLAlchemy model storing user segmentation definitions."""

# Standard library imports for uuid and timestamps
from uuid import uuid4
from datetime import datetime

# SQLAlchemy components used for column definitions
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class UserSegment(Base):
    """Represents a dynamic user segment defined by admin rules."""

    __tablename__ = "user_segments"

    # Notes: Unique identifier stored as a UUID for portability
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Short name describing the segment
    name = Column(String, nullable=False)
    # Notes: Optional longer text explaining the purpose
    description = Column(String, nullable=True)
    # Notes: JSON blob encoded as text describing the matching criteria
    criteria_json = Column(Text, nullable=False)
    # Notes: Timestamp for when the segment was created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Timestamp that updates whenever the segment is modified
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
