"""SQLAlchemy model for AI coach personalities."""

from __future__ import annotations

# Notes: Import uuid4 for generating UUID primary keys
from uuid import uuid4
# Notes: Import datetime for default timestamp
from datetime import datetime

# Notes: SQLAlchemy column and type definitions
from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID

# Notes: Base class for declarative models
from database.base import Base


class Personality(Base):
    """Represents an available coaching personality."""

    __tablename__ = "personalities"

    # Notes: Unique identifier for each personality
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Human readable name for the personality
    name = Column(String, unique=True)
    # Notes: Short description of what this personality offers
    description = Column(String)
    # Notes: System prompt text used when chatting with this personality
    system_prompt = Column(Text)
    # Notes: Timestamp when the record was created
    created_at = Column(DateTime, default=datetime.utcnow)
