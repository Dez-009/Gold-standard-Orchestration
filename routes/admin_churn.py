"""Admin endpoint exposing churn risk metrics."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import churn_prediction_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/churn/scores")
def list_churn_scores(
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return recent churn scores for admins."""

    risks = churn_prediction_service.list_churn_scores(db, limit, offset)
    return [
        {
            "id": str(r.id),
            "user_id": r.user_id,
            "churn_risk": float(r.churn_risk),
            "calculated_at": r.calculated_at.isoformat(),
            "reasons": r.reasons,
        }
        for r in risks
    ]


@router.post("/churn/recalculate")
def recalculate_churn_scores(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Trigger recalculation of churn scores for all active users."""

    churn_prediction_service.calculate_churn_scores(db)
    return {"status": "ok"}
