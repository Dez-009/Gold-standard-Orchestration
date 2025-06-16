"""Model describing a coaching personality style."""

# Notes: Import types for SQLAlchemy columns and UUIDs
from uuid import uuid4
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID

from database.base import Base


class Personality(Base):
    """Represents an available coaching personality."""

    __tablename__ = "personalities"

    # Notes: Primary key for the personality
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Human readable name of the personality
    name = Column(String, nullable=False, unique=True)
