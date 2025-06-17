"""Pydantic models for the orchestration monitoring API."""

# Notes: datetime is used for timestamp fields
from datetime import datetime
from pydantic import BaseModel


class OrchestrationLogRequest(BaseModel):
    """Request payload for creating a log entry."""

    user_id: int
    user_prompt: str
    agents_invoked: list[str]
    full_response: list[dict]


class OrchestrationLogResponse(BaseModel):
    """Response model returned to administrators."""

    id: int
    timestamp: datetime
    user_id: int
    user_prompt: str
    agents_invoked: str
    full_response: str

    class Config:
        orm_mode = True
