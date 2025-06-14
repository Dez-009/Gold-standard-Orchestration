from pydantic import BaseModel
from datetime import datetime


class SessionCreate(BaseModel):
    """Model for creating a session."""

    user_id: int
    title: str | None = None
    ai_summary: str | None = None
    conversation_history: str | None = None


class SessionResponse(BaseModel):
    """Model for returning session information."""

    id: int
    user_id: int
    title: str | None = None
    ai_summary: str | None = None
    conversation_history: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
