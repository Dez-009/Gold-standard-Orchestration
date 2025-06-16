from __future__ import annotations

"""SQLAlchemy model for queued notifications."""

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class Notification(Base):
    """Represents a single notification to be delivered to a user."""

    __tablename__ = "notifications"

    # Notes: Unique identifier for each notification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the target user
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    # Notes: Type category for the notification content
    type = Column(
        Enum("system", "reminder", "ai_nudge", name="notification_type")
    )
    # Notes: Planned delivery channel (app, email, sms, etc.)
    channel = Column(
        Enum("app", "email", "sms", "whatsapp", name="notification_channel")
    )
    # Notes: Text message to display or send
    message = Column(Text)
    # Notes: When the notification should be sent
    scheduled_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Actual time the notification was delivered
    delivered_at = Column(DateTime, nullable=True)
    # Notes: Track whether it has been sent or failed
    status = Column(
        Enum("pending", "sent", "failed", name="delivery_status"),
        default="pending",
    )
    # Notes: Timestamp when the notification record was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user model
    user = relationship("User")
