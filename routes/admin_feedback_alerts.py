"""Admin routes exposing low rating alerts."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.feedback_alert_service import get_recent_alerts

router = APIRouter(prefix="/admin/feedback-alerts", tags=["admin"])


@router.get("/")
def list_feedback_alerts(
    limit: int = 10,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return recent low-rated summaries for review."""
    # Notes: Retrieve alert objects then transform into dictionaries
    alerts = get_recent_alerts(db, limit)
    result = []
    for a in alerts:
        result.append(
            {
                "id": str(a.id),
                "user_id": a.user_id,
                "summary_id": str(a.summary_id),
                "rating": a.rating,
                "flagged_reason": a.flagged_reason,
                "created_at": a.created_at.isoformat(),
                "summary_preview": a.summary.summary_text[:100] if a.summary else "",
            }
        )
    return result

# Footnote: Future endpoints may allow resolving alerts.
