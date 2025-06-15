from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from database.base import Base


class DailyCheckIn(Base):
    """SQLAlchemy model representing a user's daily check-in."""

    __tablename__ = "daily_checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    mood = Column(String, nullable=False)
    energy_level = Column(Integer, nullable=False)
    reflections = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="daily_checkins")
