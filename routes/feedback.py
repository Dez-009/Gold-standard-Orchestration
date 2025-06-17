"""Endpoint allowing users to submit feedback."""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from database.utils import get_db
from auth.auth_utils import verify_access_token
from services.feedback_service import submit_feedback
from models.user_feedback import FeedbackType
from schemas.feedback import FeedbackCreate, FeedbackResponse

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=FeedbackResponse)
# Notes: Token is optional for anonymous submissions
async def create_feedback(
    payload: FeedbackCreate,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> FeedbackResponse:
    """Store feedback from a user or anonymous visitor."""

    # Notes: Attempt to extract user id from Authorization header
    user_id = None
    if authorization:
        token = authorization.replace("Bearer ", "")
        try:
            user_id = verify_access_token(token).get("user_id")
        except HTTPException:
            user_id = None

    # Notes: Delegate creation to the service layer
    record = submit_feedback(
        db,
        {
            "user_id": user_id,
            "feedback_type": payload.feedback_type,
            "message": payload.message,
        },
    )
    return record

