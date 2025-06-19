"""Admin routes for viewing agent self score logs."""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.agent_self_score_service import get_scores_by_agent

router = APIRouter(prefix="/admin/agent-self-scores", tags=["admin"])


@router.get("/")
def list_self_scores(
    agent_name: str,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> list[dict]:
    """Return recent self score entries for the given agent."""

    rows = get_scores_by_agent(db, agent_name, limit=limit)
    return [
        {
            "id": str(row.id),
            "agent_name": row.agent_name,
            "summary_id": str(row.summary_id),
            "user_id": row.user_id,
            "self_score": row.self_score,
            "reasoning": row.reasoning,
            "created_at": row.created_at.isoformat(),
        }
        for row in rows
    ]

# Footnote: Allows admins to review agent-reported confidence levels.

