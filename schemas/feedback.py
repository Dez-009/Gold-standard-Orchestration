"""Pydantic models for user feedback."""

from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from models.user_feedback import FeedbackType


class FeedbackCreate(BaseModel):
    """Input payload when submitting feedback."""

    feedback_type: FeedbackType
    message: str


class FeedbackResponse(BaseModel):
    """Serialized feedback record."""

    id: UUID
    user_id: int | None
    feedback_type: FeedbackType
    message: str
    submitted_at: datetime

    class Config:
        orm_mode = True
