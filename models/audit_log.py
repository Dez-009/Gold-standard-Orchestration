from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from enum import Enum

from database.base import Base


class AuditEventType(str, Enum):
    """Enum of valid audit log event types."""

    # Notes: Agent assignment created or updated by an admin
    AGENT_ASSIGNMENT = "AGENT_ASSIGNMENT"


class AuditLog(Base):
    """SQLAlchemy model representing an audit log entry."""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)
    detail = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
