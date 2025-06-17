"""Endpoint allowing users to submit feedback."""

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from database.utils import get_db
from auth.auth_utils import verify_access_token
from services.feedback_service import submit_feedback
from services.agent_feedback_service import (
    create_feedback as create_agent_feedback,
    get_feedback as get_agent_feedback,
)
from models.user_feedback import FeedbackType
from schemas.feedback import FeedbackCreate, FeedbackResponse
from schemas.agent_feedback import AgentFeedbackCreate, AgentFeedbackResponse
from auth.dependencies import get_current_user
from models.user import User

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


@router.post("/agent-summary", response_model=AgentFeedbackResponse)
# Notes: Authenticated users rate a specific AI-generated summary
async def create_agent_summary_feedback(
    payload: AgentFeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentFeedbackResponse:
    """Store feedback for an AI summary from the logged in user."""

    # Notes: Delegate persistence to the service layer
    record = create_agent_feedback(
        db,
        current_user.id,
        str(payload.summary_id),
        payload.emoji_reaction,
        payload.feedback_text,
    )
    return record


@router.get("/agent-summary/{summary_id}", response_model=AgentFeedbackResponse)
# Notes: Retrieve the feedback for a summary if one has been submitted
async def get_agent_summary_feedback(
    summary_id: str,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentFeedbackResponse:
    """Return stored agent summary feedback or 404 when absent."""

    # Notes: Query the feedback service
    record = get_agent_feedback(db, summary_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return record

