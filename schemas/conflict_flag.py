"""Pydantic schema representing a conflict flag."""

from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class ConflictFlagResponse(BaseModel):
    """Serialized conflict flag returned from the API."""

    id: UUID
    user_id: int
    journal_id: int | None
    conflict_type: str
    summary_excerpt: str
    resolution_prompt: str
    resolved: bool
    created_at: datetime

    class Config:
        orm_mode = True
