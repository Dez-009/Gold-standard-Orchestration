"""Pydantic models for admin agent assignment endpoints."""

# Notes: Import datetime to represent timestamps
from datetime import datetime

# Notes: UUID typing for the assignment record id
from uuid import UUID

from pydantic import BaseModel


class AdminAgentAssignmentRequest(BaseModel):
    """Request payload for assigning an agent to a user."""

    # Notes: Identifier of the target user
    user_id: int
    # Notes: Coaching domain receiving the agent
    domain: str
    # Notes: Name of the agent personality to assign
    assigned_agent: str


class AdminAgentAssignmentResponse(BaseModel):
    """Response model returned after an assignment is made."""

    # Notes: Unique id of the assignment record
    id: UUID
    # Notes: User receiving the assignment
    user_id: int
    # Notes: Domain where the personality applies
    domain: str
    # Notes: Name of the assigned personality
    assigned_agent: str
    # Notes: Timestamp when the assignment was stored
    assigned_at: datetime

    class Config:
        orm_mode = True
