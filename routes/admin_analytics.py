"""Admin endpoint serving aggregated analytics data."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.admin_analytics_service import get_analytics_summary
from schemas.analytics_summary import AnalyticsSummaryResponse

# Notes: Prefix ensures the path is /admin/analytics
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/analytics/summary", response_model=AnalyticsSummaryResponse)
def analytics_summary(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AnalyticsSummaryResponse:
    """Return summary information derived from analytics events."""

    # Notes: Delegate heavy lifting to the service layer
    summary = get_analytics_summary(db)
    return AnalyticsSummaryResponse(**summary)
