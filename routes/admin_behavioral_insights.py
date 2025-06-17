"""Admin route to list behavioral insights for a user."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.behavioral_insight_service import list_behavioral_insights

# Notes: Prefix groups the endpoint under /admin/behavioral-insights
router = APIRouter(prefix="/admin/behavioral-insights", tags=["admin"])


@router.get("/{user_id}")
def get_insights(
    user_id: int,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return serialized insights for the specified user."""

    insights = list_behavioral_insights(db, user_id)
    return [
        {
            "id": i.id,
            "user_id": i.user_id,
            "insight_text": i.insight_text,
            "created_at": i.created_at.isoformat(),
            "insight_type": i.insight_type,
        }
        for i in insights
    ]
