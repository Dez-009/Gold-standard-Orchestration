"""Pydantic schema returned for reflection prompts."""

from datetime import datetime
from uuid import UUID

# Notes: BaseModel for serialization
from pydantic import BaseModel


class ReflectionPromptResponse(BaseModel):
    """Model exposing a saved reflection prompt."""

    id: UUID
    journal_id: int
    prompt_text: str
    created_at: datetime

    class Config:
        orm_mode = True
