"""Pydantic models describing analytics summary payloads."""

# Notes: BaseModel used for defining response schema
from pydantic import BaseModel
from typing import Dict, List


class EventCount(BaseModel):
    """Count of events for a specific time period."""

    period: str
    count: int


class AnalyticsSummaryResponse(BaseModel):
    """Aggregated analytics data returned to the admin UI."""

    total_events: int
    events_by_type: Dict[str, int]
    events_daily: List[EventCount]
    events_weekly: List[EventCount]

    class Config:
        orm_mode = True
