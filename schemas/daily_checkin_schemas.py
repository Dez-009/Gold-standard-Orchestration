from pydantic import BaseModel
from datetime import datetime


class DailyCheckInCreate(BaseModel):
    """Model for creating a daily check-in."""

    user_id: int
    mood: str
    energy_level: int
    reflections: str | None = None


class DailyCheckInResponse(BaseModel):
    """Model for returning daily check-in information."""

    id: int
    user_id: int
    mood: str
    energy_level: int
    reflections: str | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
