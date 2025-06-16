from __future__ import annotations

"""SQLAlchemy model linking users to their preferred personalities."""

# Notes: Standard library imports for timestamps and UUID generation
from datetime import datetime
from uuid import uuid4

# Notes: SQLAlchemy core components used for column definitions
from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer
# Notes: PostgreSQL UUID type to store unique identifiers
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class UserPersonality(Base):
    """Model storing a user's chosen personality for a coaching domain."""

    __tablename__ = "user_personalities"

    # Notes: Unique identifier for the assignment record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference back to the owning user using the integer user id
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: Personality selected for this domain
    personality_id = Column(UUID(as_uuid=True), ForeignKey("personalities.id"))
    # Notes: Coaching domain where the personality applies
    domain = Column(
        Enum(
            "career",
            "health",
            "relationships",
            "finance",
            "spirituality",
            "mental_health",
            name="coaching_domain",
        )
    )
    # Notes: Timestamp when the personality was assigned
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the user owning the assignment
    user = relationship("User", back_populates="personality_assignments")
    # Notes: Relationship to the Personality model
    personality = relationship("Personality")
