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
from orchestration.executor import execute_agent
import asyncio

# Notes: Router configured under the /ai prefix
router = APIRouter(prefix="/ai", tags=["ai"])


@router.get("/journal-summary", response_model=JournalSummaryResponse)
# Notes: Endpoint returning the latest journal summary for the user
async def get_journal_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JournalSummaryResponse:
    """Return an AI-generated summary of recent journals."""

    async def _call() -> str:
        # Notes: Run blocking generation in a thread to avoid blocking event loop
        return await asyncio.to_thread(generate_journal_summary, db, current_user.id)

    # Notes: Execute with retry and timeout monitoring
    result = await execute_agent(db, "JournalSummary", current_user.id, _call)
    # Notes: Wrap text and metadata in the response model
    return JournalSummaryResponse(
        summary=result.text,
        retry_count=result.retry_count,
        timeout_occurred=result.timeout_occurred,
    )
