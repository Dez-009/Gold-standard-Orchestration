"""SQLAlchemy model representing a user's active persona snapshot."""

from __future__ import annotations

# Notes: built-in helpers for timestamps and uuid generation
from datetime import datetime
from uuid import uuid4

# Notes: SQLAlchemy column types and utilities
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID

# Notes: Base class for all ORM models
from database.base import Base


class UserPersona(Base):
    """Persist the latest inferred personality traits for a user."""

    __tablename__ = "user_personas"

    # Notes: Unique identifier for the persona snapshot
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Reference to the owning user record
    user_id = Column(Integer, ForeignKey("users.id"))
    # Notes: JSON array storing personality trait labels
    traits = Column(JSON, nullable=False)
    # Notes: Timestamp when these traits were last updated
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Footnote: Allows admins to inspect a user's persona for coaching context.
