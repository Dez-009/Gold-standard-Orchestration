from pydantic import BaseModel
from datetime import datetime


class GoalCreate(BaseModel):
    """Model for creating a goal."""

    user_id: int
    title: str
    description: str | None = None
    progress: int | None = 0
    target: int | None = None


class GoalResponse(BaseModel):
    """Model for returning goal information."""

    id: int
    user_id: int
    title: str
    description: str | None = None
    progress: int | None = None
    target: int | None = None
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class GoalProgressUpdate(BaseModel):
    """Payload for updating goal progress or target."""

    progress: int | None = None
    target: int | None = None
