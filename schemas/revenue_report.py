"""Pydantic schema defining the admin revenue report structure."""

# Notes: BaseModel used for API response serialization
from pydantic import BaseModel


class RevenueReportResponse(BaseModel):
    """Metrics returned by the /admin/revenue/report endpoint."""

    active_subscribers: int
    churned_subscribers: int
    mrr: float
    arr: float
    arpu: float
    revenue_growth: float

    class Config:
        orm_mode = True

# Notes: Future versions may extend this with monthly trend data
