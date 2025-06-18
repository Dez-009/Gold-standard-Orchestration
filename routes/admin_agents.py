"""Admin route exposing agent retry functionality."""

from __future__ import annotations

# Notes: Import FastAPI router and dependency utilities
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User

# Notes: Service method that performs the retry
from services.agent_orchestration import retry_agent_run
from services.agent_failure_log import get_failures

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/agents/retry")
def admin_retry_agent(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Retry a specific agent run using its original journal context."""

    summary_id = payload.get("summary_id")
    agent_name = payload.get("agent_name")
    if not summary_id or not agent_name:
        raise HTTPException(status_code=400, detail="summary_id and agent_name required")

    try:
        output = retry_agent_run(db, summary_id, agent_name)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - unexpected failures
        raise HTTPException(status_code=500, detail="Agent retry failed") from exc

    return {"output": output}


@router.get("/agents/failures")
def list_agent_failures(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
) -> dict:
    """Return recent agent failures with pagination metadata."""

    # Notes: Query recent failures using service helper
    entries = get_failures(db, limit=limit, offset=offset)
    return {
        "results": [
            {
                "id": str(e.id),
                "user_id": e.user_id,
                "agent_name": e.agent_name,
                "reason": e.reason,
                "failed_at": e.failed_at.isoformat(),
            }
            for e in entries
        ],
        "limit": limit,
        "offset": offset,
        "count": len(entries),
    }

# Footnote: Fully admin protected endpoint for manual agent retry operations.
