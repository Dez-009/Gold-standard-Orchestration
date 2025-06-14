from pydantic import BaseModel
from datetime import datetime


class GoalCreate(BaseModel):
    """Model for creating a goal."""

    user_id: int
    title: str
    description: str | None = None


class GoalResponse(BaseModel):
    """Model for returning goal information."""

    id: int
    user_id: int
    title: str
    description: str | None = None
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
