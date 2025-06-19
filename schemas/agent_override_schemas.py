"""Pydantic models for agent assignment override operations."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AgentOverrideRequest(BaseModel):
    """Request payload to override a user's assigned agent."""

    # Notes: Identifier of the user receiving the override
    user_id: int
    # Notes: Identifier of the agent to assign
    agent_id: UUID


class AgentOverrideResponse(BaseModel):
    """Response model representing an override record."""

    # Notes: Primary key of the override entry
    id: int
    # Notes: User receiving the override
    user_id: int
    # Notes: Agent identifier selected by the admin
    agent_id: UUID
    # Notes: Timestamp when the override was recorded
    assigned_at: datetime

    class Config:
        # Notes: Allow returning ORM objects directly from the database
        orm_mode = True
