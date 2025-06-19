"""Routes exposing system metrics to administrators."""

from fastapi import APIRouter, Depends

from auth.dependencies import get_current_admin_user
from models.user import User
from sqlalchemy.orm import Session

from database.utils import get_db
from services.system_metrics_service import get_recent_metrics

# Notes: Prefix groups these endpoints under /admin/metrics
router = APIRouter(prefix="/admin/metrics", tags=["admin"])


@router.get("/")
def read_metrics(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return current system metrics for the dashboard."""
    # Notes: Fetch the latest metrics computed from database tables
    return get_recent_metrics(db)

