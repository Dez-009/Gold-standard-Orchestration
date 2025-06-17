"""Admin endpoint exposing churn risk metrics."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import churn_risk_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/churn")
def list_churn_risk(
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return recent churn risk calculations for admins."""

    risks = churn_risk_service.list_churn_risks(db, limit, offset)
    return [
        {
            "id": str(r.id),
            "user_id": r.user_id,
            "risk_score": float(r.risk_score),
            "risk_category": r.risk_category,
            "calculated_at": r.calculated_at.isoformat(),
        }
        for r in risks
    ]
