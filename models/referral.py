from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class Referral(Base):
    """SQLAlchemy model tracking referrals between users."""

    __tablename__ = "referrals"

    # Unique identifier for this referral instance
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: User who generated the referral code
    referrer_user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: User who signed up using the referral code
    referred_user_id = Column(ForeignKey("users.id"), nullable=True)
    # Notes: Referral code shared with friends
    referral_code = Column(String, unique=True, nullable=False)
    # Notes: Timestamp when the record was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # ORM relationships for convenient access
    referrer = relationship("User", foreign_keys=[referrer_user_id])
    referred = relationship("User", foreign_keys=[referred_user_id])
