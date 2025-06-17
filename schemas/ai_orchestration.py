"""Pydantic models for the multi-agent orchestration API."""

from typing import List
from pydantic import BaseModel


class AIOrchestrationRequest(BaseModel):
    """Request payload for running the orchestration processor."""

    user_id: int
    user_prompt: str


class AgentReply(BaseModel):
    """Single agent response entry."""

    agent: str
    response: str


class AIOrchestrationResponse(BaseModel):
    """Aggregated responses from all agents."""

    responses: List[AgentReply]

    class Config:
        orm_mode = True
