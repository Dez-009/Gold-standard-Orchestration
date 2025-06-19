from __future__ import annotations

"""SQLAlchemy model for queued notifications."""

from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from database.base import Base


class Notification(Base):
    """Represents a queued notification ready for delivery."""

    __tablename__ = "notifications"

    # Notes: Unique numeric identifier for the notification
    id = Column(Integer, primary_key=True, index=True)
    # Notes: ID of the user that should receive the notification
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Delivery medium such as email, sms or push
    type = Column(Enum("email", "sms", "push", name="notification_type"))
    # Notes: Optional external provider identifier for tracing
    channel = Column(String, nullable=True)
    # Notes: Text body of the notification
    message = Column(Text)
    # Notes: Current delivery state of the notification
    status = Column(
        Enum("pending", "sent", "failed", name="notification_status"),
        default="pending",
    )
    # Notes: Time the notification was created
    created_at = Column(DateTime, default=datetime.utcnow)
    # Notes: Time the notification was successfully sent
    sent_at = Column(DateTime, nullable=True)

    # Notes: Relationship back to the user model
    user = relationship("User")
