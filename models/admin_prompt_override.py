"""SQLAlchemy model for admin-defined prompt overrides."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Column, String, Text, Boolean, DateTime, Integer, UniqueConstraint

from database.base import Base


class AdminPromptOverride(Base):
    """Represents an active custom prompt for a specific agent."""

    __tablename__ = "admin_prompt_overrides"
    __table_args__ = (UniqueConstraint("agent_name", name="uq_admin_prompt_agent"),)

    id = Column(Integer, primary_key=True)
    agent_name = Column(String, nullable=False)
    prompt_text = Column(Text, nullable=False)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<AdminPromptOverride {self.agent_name}>"
