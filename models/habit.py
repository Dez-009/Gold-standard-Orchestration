from __future__ import annotations

"""SQLAlchemy model for user habits."""

# Notes: Standard library import for timestamp management
from datetime import datetime

# Notes: Core SQLAlchemy classes used for model fields
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
# Notes: Provides the relationship function for ORM mapping
from sqlalchemy.orm import relationship

# Notes: Base class from which all models inherit
from database.base import Base


class Habit(Base):
    """Represents a recurring habit tracked for a user."""

    # Notes: Name of the database table for this model
    __tablename__ = "habits"

    # Notes: Unique identifier for each habit entry
    id = Column(Integer, primary_key=True, index=True)
    # Notes: Reference to the user that owns the habit
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Human-readable name describing the habit
    habit_name = Column(String, nullable=False)
    # Notes: Indicates how often the habit should occur (e.g. daily, weekly)
    frequency = Column(String, nullable=False)
    # Notes: Count of consecutive completions for this habit
    streak_count = Column(Integer, default=0)
    # Notes: Timestamp of when the habit was most recently logged
    last_logged = Column(DateTime, default=datetime.utcnow)
    # Notes: Timestamp recording when this habit was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the owning user instance
    user = relationship("User", back_populates="habits")
