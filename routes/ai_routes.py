"""Routes providing AI-powered utilities beyond coaching."""

# Notes: Import FastAPI router utilities and dependencies
from fastapi import APIRouter, Depends

# Notes: Import SQLAlchemy Session type for database interactions
from sqlalchemy.orm import Session

# Notes: Dependency helpers for database session and current user
from database.utils import get_db
from auth.dependencies import get_current_user

# Notes: Import the user model used for type hints
from models.user import User

# Notes: Import the journal summarization service function
from services.journal_summary_service import summarize_user_journals

# Notes: Initialize the router with an "/ai" prefix
router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/journal-summary")
# Notes: Endpoint that returns a summary of the user's recent journals
async def journal_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Summarize the authenticated user's latest journal entries."""
    # Notes: Delegate summarization to the service layer
    summary = summarize_user_journals(current_user.id, db)
    # Notes: Return the generated summary in JSON format
    return {"summary": summary}
