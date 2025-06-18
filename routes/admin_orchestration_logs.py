"""Admin API endpoints exposing orchestration performance logs."""

# Notes: FastAPI router utilities
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User

# Notes: Service responsible for persisting and retrieving log data
from services.orchestration_log_service import fetch_logs, get_override_history

# Notes: Prefix matches other admin routes
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/orchestration-logs")
def get_orchestration_logs(
    skip: int = 0,
    limit: int = 100,
    override: bool | None = None,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return orchestration performance logs for administrator dashboards."""

    logs = fetch_logs(db, skip=skip, limit=limit, override=override)
    # Notes: Convert ORM objects to simple dictionaries for JSON response
    return [
        {
            "id": str(log.id),
            "agent_name": log.agent_name,
            "user_id": log.user_id,
            "execution_time_ms": log.execution_time_ms,
            "input_tokens": log.input_tokens,
            "output_tokens": log.output_tokens,
            "status": log.status,
            "fallback_triggered": log.fallback_triggered,
            # Notes: Expose timeout flag for admin dashboards
            "timeout_occurred": log.timeout_occurred,
            "timestamp": log.timestamp.isoformat(),
        }
        for log in logs
    ]


@router.get("/orchestration-override")
def override_history(
    user_id: int,
    agent_name: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return override execution history for a user and agent."""

    records = get_override_history(db, user_id, agent_name)
    return [
        {
            "id": str(r.id),
            "timestamp": r.timestamp.isoformat(),
            "reason": r.override_reason,
            "run_id": str(r.id),
        }
        for r in records
    ]

# Footnote: Allows admins to inspect orchestration latency and token counts.
