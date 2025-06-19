"""SQLAlchemy model for tracking user login sessions."""

# Notes: Required imports for datetime and UUID generation
from datetime import datetime
from uuid import uuid4

# Notes: SQLAlchemy column types and utilities
from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class UserSession(Base):
    """Database model storing individual user session records."""

    __tablename__ = "user_sessions"

    # Notes: Primary key using a UUID for uniqueness across systems
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Foreign key back to the user who owns this session
    user_id = Column(ForeignKey("users.id"), nullable=False)
    # Notes: Timestamp when the session began
    session_start = Column(DateTime, default=datetime.utcnow)
    # Notes: Timestamp when the session ended, nullable until logout
    session_end = Column(DateTime, nullable=True)
    # Notes: Duration in seconds calculated when the session ends
    total_duration = Column(String, nullable=True)
    # Notes: User agent string captured from the request headers
    user_agent = Column(String, nullable=True)
    # Notes: IP address captured from the incoming request
    ip_address = Column(String, nullable=True)

    # Notes: Relationship back to the user model for easy lookup
    user = relationship("User", back_populates="user_sessions")
