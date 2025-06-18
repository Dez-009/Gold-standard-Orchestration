"""Admin route exposing submitted feedback."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.feedback_service import list_feedback
from services.feedback_analytics_service import get_feedback_summary
from models.user_feedback import FeedbackType

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/feedback")
# Notes: Only admins are permitted to view feedback submissions
def admin_list_feedback(
    limit: int = 100,
    offset: int = 0,
    feedback_type: FeedbackType | None = None,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return paginated feedback records for review."""

    # Notes: Fetch records from the service layer
    records = list_feedback(db, limit=limit, offset=offset, feedback_type=feedback_type)
    # Notes: Convert ORM objects to simple dictionaries for the response
    return [
        {
            "id": str(r.id),
            "user_id": r.user_id,
            "feedback_type": r.feedback_type.value,
            "message": r.message,
            "submitted_at": r.submitted_at.isoformat(),
        }
        for r in records
    ]


@router.get("/feedback/summary")
def feedback_summary(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return aggregated feedback metrics by agent."""

    summary = get_feedback_summary(db)
    # Notes: Only return per-agent portion for the API response
    return summary["agents"]

