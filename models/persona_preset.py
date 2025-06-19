"""SQLAlchemy model defining reusable agent persona presets."""

from __future__ import annotations

# Notes: import uuid generator and timestamp helper
from uuid import uuid4
from datetime import datetime

# Notes: SQLAlchemy column definitions
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID

# Notes: Base class for declarative models
from database.base import Base


class PersonaPreset(Base):
    """Represents a named set of trait weights for agent responses."""

    __tablename__ = "persona_presets"

    # Notes: Unique identifier for each preset
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Human readable name shown in admin UI
    name = Column(String, unique=True, nullable=False)
    # Notes: Long form text describing how this preset should feel
    description = Column(Text)
    # Notes: JSON object mapping trait names to numeric weights
    traits = Column(JSON, nullable=False)
    # Notes: Timestamp when this preset was created
    created_at = Column(DateTime, default=datetime.utcnow)

    # Footnote: Traits are injected into prompts to adjust the agent tone.

