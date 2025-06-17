"""Admin endpoints exposing revenue metrics."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from models.user import User
from database.utils import get_db
from services.revenue_service import get_revenue_summary
from services.revenue_reporting_service import generate_revenue_report
from schemas.revenue_summary import RevenueSummaryResponse
from schemas.revenue_report import RevenueReportResponse

# Notes: Prefix groups the route under /admin/revenue
router = APIRouter(prefix="/admin/revenue", tags=["admin"])


@router.get("/summary", response_model=RevenueSummaryResponse)
def revenue_summary(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> RevenueSummaryResponse:
    """Return aggregated revenue statistics for admins."""
    # Notes: Delegate computation to the revenue service layer
    return get_revenue_summary(db)


@router.get("/report", response_model=RevenueReportResponse)
def revenue_report(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> RevenueReportResponse:
    """Return a detailed revenue report for admins."""
    # Notes: Compute extended revenue metrics from the service layer
    return generate_revenue_report(db)
