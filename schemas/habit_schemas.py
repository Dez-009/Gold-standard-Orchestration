"""Pydantic models for habit-related endpoints."""

# Notes: Base model and datetime utility types
from pydantic import BaseModel
from datetime import datetime


class HabitCreate(BaseModel):
    """Schema for creating a new habit."""

    # Identifier linking the habit to a user
    user_id: int
    # Descriptive name for the habit
    habit_name: str
    # How often the habit should occur (e.g. daily)
    frequency: str


class HabitResponse(BaseModel):
    """Schema returned when reading habit information."""

    # Identifier linking the habit to a user
    user_id: int
    # Unique identifier for the habit record
    id: int
    # Descriptive name for the habit
    habit_name: str
    # How often the habit should occur
    frequency: str
    # Count of consecutive times the habit was logged
    streak_count: int
    # Timestamp of the last time the habit was logged
    last_logged: datetime | None
    # Timestamp when the habit was created
    created_at: datetime

    class Config:
        # Notes: Allow creation from ORM objects
        orm_mode = True
