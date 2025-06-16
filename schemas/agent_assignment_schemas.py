"""Pydantic models for agent assignment operations."""

from datetime import datetime
from pydantic import BaseModel


class AgentAssignmentRequest(BaseModel):
    """Request payload for assigning an agent."""

    # Requested coaching domain, e.g. career, health
    domain: str


class AdminAgentAssignmentRequest(BaseModel):
    """Request payload for admin agent assignment."""

    # Notes: Target user identifier for the assignment
    user_id: int
    # Notes: Domain-specific agent type to assign
    agent_type: str


class AgentAssignmentResponse(BaseModel):
    """Response model representing an assignment."""

    # Database identifier of the assignment
    id: int
    # Identifier of the user that owns the assignment
    user_id: int
    # Type of agent assigned
    agent_type: str
    # Timestamp when the assignment occurred
    assigned_at: datetime

    class Config:
        # Notes: Allow conversion from ORM objects
        orm_mode = True

