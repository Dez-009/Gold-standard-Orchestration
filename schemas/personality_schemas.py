# Notes: Pydantic models describing Personality data
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class PersonalityCreate(BaseModel):
    """Schema for creating a new Personality."""

    # Notes: Name visible to users
    name: str
    # Notes: Optional description shown in UI
    description: str | None = None
    # Notes: Instruction text used for the AI system prompt
    system_prompt: str


class PersonalityResponse(BaseModel):
    """Schema returned from Personality endpoints."""

    # Notes: UUID identifier for the personality
    id: UUID
    name: str
    description: str | None = None
    system_prompt: str
    created_at: datetime

    class Config:
        # Notes: Allow returning ORM objects directly
        orm_mode = True
