"""Pydantic models for agent summary feedback."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AgentFeedbackCreate(BaseModel):
    """Request body when submitting feedback on a summary."""

    summary_id: UUID
    emoji_reaction: str
    feedback_text: str | None = None


class AgentFeedbackResponse(BaseModel):
    """Serialized AgentFeedback record."""

    id: UUID
    user_id: int
    summary_id: UUID
    emoji_reaction: str
    feedback_text: str | None
    created_at: datetime

    class Config:
        orm_mode = True
