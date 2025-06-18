"""Model storing moderator flag reasons."""

from __future__ import annotations

from uuid import uuid4
from datetime import datetime

from sqlalchemy import Column, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class FlagReason(Base):
    """Predefined reasons admins can select when flagging content."""

    __tablename__ = "flag_reasons"

    # Primary identifier for the reason
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Short label shown in dropdowns, e.g. "Inappropriate"
    label = Column(String, nullable=False, unique=True)
    # Optional high level category to group reasons
    category = Column(String, nullable=True)
    # When this reason was created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Last update timestamp for auditing changes
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Footnote: Admins manage these rows via the flag reason admin interface.
