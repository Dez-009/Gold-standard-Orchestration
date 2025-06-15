from __future__ import annotations

"""SQLAlchemy model for user tasks."""

from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database.base import Base


class Task(Base):
    """Represents a to-do task assigned to a user."""

    __tablename__ = "tasks"

    # Primary key identifier for the task
    id = Column(Integer, primary_key=True, index=True)
    # Link back to the owning user
    user_id = Column(Integer, ForeignKey("users.id"))
    # Text description of what needs to be done
    description = Column(String, nullable=False)
    # Flag indicating if the task has been completed
    is_completed = Column(Boolean, default=False)
    # Optional due date for the task
    due_date = Column(DateTime, nullable=True)
    # Timestamp when the task was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship back to the user that owns this task
    user = relationship("User", back_populates="tasks")

