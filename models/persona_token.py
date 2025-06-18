"""SQLAlchemy model storing persona tokens assigned to users."""

from __future__ import annotations

from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from database.base import Base


class PersonaToken(Base):
    """Represents an active persona token for a user."""

    __tablename__ = "persona_tokens"

    # Notes: Unique identifier for the token record
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Owning user referenced by id
    user_id = Column(ForeignKey("users.id"))
    # Notes: Short code name for the token behavior
    token_name = Column(String, nullable=False)
    # Notes: Optional description describing the coaching style
    description = Column(Text)
    # Notes: Timestamp the token was assigned to the user
    assigned_at = Column(DateTime, default=datetime.utcnow)

    # Notes: Relationship back to the User model
    user = relationship("User", back_populates="persona_tokens")

# Footnote: Defines the PersonaToken ORM mapping.
