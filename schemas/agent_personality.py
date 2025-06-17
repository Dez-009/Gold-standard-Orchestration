"""Pydantic schemas for agent personality assignments."""

# Notes: Import datetime for response timestamp
from datetime import datetime
# Notes: UUID type to represent assignment id
from uuid import UUID

from pydantic import BaseModel


class AgentPersonalityRequest(BaseModel):
    """Request payload for selecting a personality specialization."""

    # Notes: Coaching domain such as career or health
    domain: str
    # Notes: Name of the personality to use within that domain
    personality: str


class AgentPersonalityResponse(BaseModel):
    """Response model returned from assignment endpoints."""

    # Notes: Unique identifier of the assignment
    id: UUID
    # Notes: Identifier of the user that owns the assignment
    user_id: int
    # Notes: Coaching domain for the assignment
    domain: str
    # Notes: Human-readable personality name
    personality: str
    # Notes: Timestamp the personality was assigned
    assigned_at: datetime

    class Config:
        # Notes: Allow returning ORM objects from service layer
        orm_mode = True
