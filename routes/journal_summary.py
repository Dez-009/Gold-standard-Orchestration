"""Route providing AI-generated summaries of journal entries."""

# Notes: FastAPI router and dependency utilities
from fastapi import APIRouter, Depends

# Notes: SQLAlchemy session type for database operations
from sqlalchemy.orm import Session

# Notes: Dependency helpers for auth and DB access
from auth.dependencies import get_current_user
from database.utils import get_db

# Notes: Import the user model and summary generator
from models.user import User
from services.ai_processor import generate_journal_summary
from schemas.journal_summary import JournalSummaryResponse

# Notes: Router configured under the /ai prefix
router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/journal-summary", response_model=JournalSummaryResponse)
# Notes: Endpoint returning the latest journal summary for the user
def get_journal_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalSummaryResponse:
    """Return an AI-generated summary of recent journals."""

    # Notes: Delegate to the AI processor which also persists the summary
    summary = generate_journal_summary(db, current_user.id)
    # Notes: Wrap the summary text in the response schema
    return JournalSummaryResponse(summary=summary)
