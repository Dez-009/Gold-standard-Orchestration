"""Pydantic models for analytics events."""

# Notes: BaseModel for request validation
from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


class AnalyticsEventCreate(BaseModel):
    """Schema describing an analytics event submission."""

    # Notes: Type string categorizing the event
    event_type: str
    # Notes: Arbitrary payload metadata for the event
    event_payload: dict


class AnalyticsEventResponse(BaseModel):
    """Schema for returning stored analytics events."""

    id: UUID
    user_id: int | None
    event_type: str
    # Notes: JSON string stored for the event payload
    event_payload: str
    timestamp: datetime

    class Config:
        orm_mode = True
