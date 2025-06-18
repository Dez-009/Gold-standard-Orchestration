from __future__ import annotations

"""SQLAlchemy model storing versioned prompt templates for agents."""

# Notes: Import helpers for UUID primary keys and timestamp defaults
from uuid import uuid4
from datetime import datetime

# Notes: SQLAlchemy column types used for the model definition
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID

# Notes: Base declarative model shared across the application
from database.base import Base


class PromptVersion(Base):
    """Represents a single version of an agent prompt template."""

    __tablename__ = "prompt_versions"

    # Notes: Unique identifier for each prompt version
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    # Notes: Name of the agent this prompt belongs to
    agent_name = Column(String, nullable=False)
    # Notes: Version label e.g. "v1" or "v2.1"
    version = Column(String, nullable=False)
    # Notes: Template text injected into the LLM call
    prompt_template = Column(Text, nullable=False)
    # Notes: Optional JSON metadata such as temperature or tags
    metadata_json = Column(JSON, nullable=True)
    # Notes: Timestamp when this version record was created
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        """Return debug-friendly string including agent and version."""

        return f"<PromptVersion {self.agent_name} {self.version}>"

# Footnote: Enables historical tracking of prompt changes for reproducibility.
