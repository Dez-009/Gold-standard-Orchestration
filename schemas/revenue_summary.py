"""Pydantic schema representing revenue summary metrics."""

from pydantic import BaseModel

# Notes: Schema used for returning revenue metrics to the frontend


class RevenueSummaryResponse(BaseModel):
    """Structure returned by the /admin/revenue/summary endpoint."""

    active_subscriptions: int
    mrr: float
    arr: float
    lifetime_revenue: float

    class Config:
        orm_mode = True

# Notes: Additional configuration may be added in the future
