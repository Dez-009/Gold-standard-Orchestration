"""Admin route providing access to orchestration logs."""

# Notes: FastAPI utilities for routing and dependency injection
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User

# Notes: Service exposing log creation and retrieval functions
from services import orchestration_audit_service
from schemas.admin_orchestration_monitor import (
    OrchestrationLogResponse,
)

# Notes: Prefix groups the endpoint under /admin/orchestration-log
router = APIRouter(prefix="/admin/orchestration-log", tags=["admin"])


@router.get("/", response_model=list[OrchestrationLogResponse])
def list_orchestration_logs(
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return recent orchestration log entries."""

    logs = orchestration_audit_service.get_recent_orchestration_logs(db, limit, offset)
    # Notes: Convert ORM objects to dictionaries for JSON response
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat(),
            "user_id": log.user_id,
            "user_prompt": log.user_prompt,
            "agents_invoked": log.agents_invoked,
            "full_response": log.full_response,
        }
        for log in logs
    ]
