"""Routes exposing system metrics to administrators."""

from fastapi import APIRouter, Depends

from auth.dependencies import get_current_admin_user
from models.user import User
from services.metrics_service import get_system_metrics

# Notes: Prefix groups these endpoints under /admin/metrics
router = APIRouter(prefix="/admin/metrics", tags=["admin"])


@router.get("/")
def read_metrics(_: User = Depends(get_current_admin_user)) -> dict:
    """Return current system metrics for the dashboard."""
    # Notes: Delegate retrieval to the service layer which currently returns
    # placeholder values. This keeps routing code simple.
    return get_system_metrics()

