"""Admin routes for viewing agent scoring logs."""

# Notes: FastAPI router and dependencies
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.agent_scoring_service import list_agent_scores
from datetime import datetime

router = APIRouter(prefix="/admin/agent-scores", tags=["admin"])


@router.get("/")
def list_agent_scores(
    limit: int = 100,
    offset: int = 0,
    agent_name: str | None = None,
    user_id: int | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> list[dict]:
    """Return recent agent scoring entries."""

    # Notes: Parse optional ISO dates for filtering if provided
    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None

    # Notes: Delegate retrieval with filters to the service layer
    rows = list_agent_scores(
        db,
        agent_name=agent_name,
        user_id=user_id,
        start_date=start_dt,
        end_date=end_dt,
        limit=limit,
        offset=offset,
    )

    # Notes: Convert ORM rows to dictionaries for the API response
    return [
        {
            "id": str(row.id),
            "user_id": row.user_id,
            "agent_name": row.agent_name,
            "completeness_score": row.completeness_score,
            "clarity_score": row.clarity_score,
            "relevance_score": row.relevance_score,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]

# Footnote: Allows administrators to monitor agent answer quality.

