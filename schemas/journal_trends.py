"""Pydantic schemas for journal trend analysis responses."""

# Notes: Import BaseModel for schema definitions
from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict


class JournalTrendResponse(BaseModel):
    """Serialized representation of a JournalTrend record."""

    id: str
    user_id: int
    timestamp: datetime
    mood_summary: Any
    keyword_trends: Dict[str, int] | list | None
    goal_progress_notes: str

    class Config:
        orm_mode = True
