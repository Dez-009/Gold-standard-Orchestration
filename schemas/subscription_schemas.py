"""Schemas related to subscription management."""

from datetime import datetime
from pydantic import BaseModel


class SubscriptionCreate(BaseModel):
    """Data required to create a subscription record."""

    user_id: int
    stripe_subscription_id: str
    status: str


class SubscriptionResponse(BaseModel):
    """Representation of a subscription returned via the API."""

    id: int
    user_id: int
    stripe_subscription_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
