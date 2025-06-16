from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

# Notes: Import the mood enum defined in the model for validation
from models.daily_checkin import Mood


class DailyCheckInCreate(BaseModel):
    """Payload for creating a new health check-in."""

    # Notes: Mood selection from the enum
    mood: Mood
    # Notes: Energy rating between 1 and 10
    energy_level: int
    # Notes: Stress rating between 1 and 10
    stress_level: int
    # Notes: Optional text notes about the day
    notes: str | None = None


class DailyCheckInResponse(BaseModel):
    """Representation of a stored health check-in."""

    # Notes: Unique identifier of the check-in
    id: UUID
    # Notes: Identifier of the user that submitted the check-in
    user_id: int
    # Notes: Mood value saved for the day
    mood: Mood
    # Notes: Energy rating between 1 and 10
    energy_level: int
    # Notes: Stress rating between 1 and 10
    stress_level: int
    # Notes: Optional text notes provided by the user
    notes: str | None = None
    # Notes: Timestamp when the check-in was created
    created_at: datetime

    class Config:
        orm_mode = True
