"""Admin route serving aggregated behavioral insights."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.behavioral_insights_service import generate_behavioral_insights

# Notes: Prefix ensures the endpoint lives under /admin
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/behavioral-insights")
def read_behavioral_insights(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return recent behavioral insights for the admin dashboard."""

    # Notes: Delegate computation to the service layer
    return generate_behavioral_insights(db)
