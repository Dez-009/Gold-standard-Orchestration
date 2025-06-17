from pydantic import BaseModel
from datetime import datetime


class JournalEntryCreate(BaseModel):
    """Model for creating a journal entry."""

    user_id: int
    title: str | None = None
    content: str
    # Optional goal to associate with this journal entry
    linked_goal_id: int | None = None


class JournalEntryResponse(BaseModel):
    """Model for returning journal entry information."""

    id: int
    user_id: int
    title: str | None = None
    content: str
    # Include the linked goal id in responses
    linked_goal_id: int | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
