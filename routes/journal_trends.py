"""Route exposing AI-derived journal trend insights."""

# Notes: FastAPI router and dependency utilities
from fastapi import APIRouter, Depends

# Notes: SQLAlchemy session type for DB operations
from sqlalchemy.orm import Session

# Notes: Authentication dependency and DB session helper
from auth.dependencies import get_current_user
from database.utils import get_db

# Notes: Import the user model and AI processor function
from models.user import User
from services.ai_processor import analyze_journal_trends
from schemas.journal_trends import JournalTrendResponse

# Notes: Initialize router under the /ai prefix
router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/journal-trends", response_model=JournalTrendResponse)
# Notes: Endpoint returning trend analysis of user journals
def get_journal_trends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalTrendResponse:
    """Return AI-generated journal trend insights for the user."""

    # Notes: Delegate to service which also persists the analysis
    result = analyze_journal_trends(db, current_user.id)
    # Notes: Cast the dictionary into the response schema
    return JournalTrendResponse(**result)
