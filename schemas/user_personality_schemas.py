"""Pydantic schemas for assigning personalities to users."""

# Notes: Standard library import for timestamps
from datetime import datetime
# Notes: UUID type used by the personality models
from uuid import UUID

from pydantic import BaseModel


class UserPersonalityRequest(BaseModel):
    """Request payload for users selecting a personality."""

    # Notes: Identifier of the chosen personality
    personality_id: UUID
    # Notes: Coaching domain the personality applies to
    domain: str


class AdminUserPersonalityRequest(BaseModel):
    """Request payload for admin assignments."""

    # Notes: Target user receiving the assignment
    user_id: int
    # Notes: Personality identifier to assign
    personality_id: UUID
    # Notes: Coaching domain for the assignment
    domain: str


class UserPersonalityResponse(BaseModel):
    """Response model representing a personality assignment."""

    # Notes: Primary key of the assignment record
    id: UUID
    # Notes: ID of the user who owns the assignment
    user_id: int
    # Notes: Personality identifier
    personality_id: UUID
    # Notes: Coaching domain where this personality applies
    domain: str
    # Notes: Timestamp the personality was assigned
    assigned_at: datetime

    class Config:
        # Notes: Allow returning ORM objects from API endpoints
        orm_mode = True
