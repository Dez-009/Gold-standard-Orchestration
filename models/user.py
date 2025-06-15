from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship

from database.base import Base


class User(Base):
    """SQLAlchemy model for application users."""

    __tablename__ = "users"

    # Basic user attributes
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    phone_number = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships to other models
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete"
    )
    journal_entries = relationship(
        "JournalEntry", back_populates="user", cascade="all, delete"
    )
    goals = relationship(
        "Goal", back_populates="user", cascade="all, delete"
    )
    # Track the tasks assigned to the user
    tasks = relationship(
        "Task", back_populates="user", cascade="all, delete"
    )
    daily_checkins = relationship(
        "DailyCheckIn", back_populates="user", cascade="all, delete"
    )
    audit_logs = relationship(
        "AuditLog", back_populates="user", cascade="all, delete"
    )
    # Notes: Track the habits associated with the user
    habits = relationship(
        "Habit", back_populates="user", cascade="all, delete"
    )
