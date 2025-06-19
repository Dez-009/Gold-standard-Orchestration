"""Admin routes for triggering goal recommendations."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.personalized_recommendation_service import generate_goals_for_segment

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/recommendations/trigger")
def trigger_segment_recommendations(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Generate goal suggestions for all users in the segment."""

    # Notes: Validate required segment identifier
    segment_id = payload.get("segment_id")
    if not segment_id:
        raise HTTPException(status_code=400, detail="segment_id required")

    # Notes: Execute recommendation generation synchronously for now
    created = generate_goals_for_segment(db, segment_id)

    # Notes: Return the number of goals that were created
    return {"created": len(created)}
