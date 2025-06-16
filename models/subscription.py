from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database.base import Base


class Subscription(Base):
    """Represent a user's subscription record."""

    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    stripe_subscription_id = Column(String, unique=True, nullable=False)
    status = Column(String, default="trialing")
    # Notes: When the subscription is scheduled to cancel, Stripe provides a timestamp
    cancel_at = Column(DateTime, nullable=True)
    # Notes: Timestamp for the end of the current billing period
    current_period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
