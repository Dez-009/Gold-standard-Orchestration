"""Admin routes for viewing agent scoring logs."""

# Notes: FastAPI router and dependencies
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from models.agent_score import AgentScore

router = APIRouter(prefix="/admin/agent-scores", tags=["admin"])


@router.get("/")
def list_agent_scores(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> list[dict]:
    """Return recent agent scoring entries."""

    # Notes: Query most recent scores with pagination
    rows = (
        db.query(AgentScore)
        .order_by(AgentScore.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
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

