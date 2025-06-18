from __future__ import annotations

from uuid import uuid4
from datetime import datetime
from enum import Enum

from sqlalchemy import Column, String, Boolean, DateTime, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class AccessTier(str, Enum):
    """Supported tiers controlling feature visibility."""

    free = "free"
    plus = "plus"
    pro = "pro"
    admin = "admin"


class FeatureFlag(Base):
    """Controls visibility and availability of features per role"""

    __tablename__ = "feature_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    feature_key = Column(String, unique=True, nullable=False)
    access_tier = Column(PgEnum(AccessTier), nullable=False, default=AccessTier.free)
    enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<FeatureFlag {self.feature_key} {self.access_tier} enabled={self.enabled}>"
