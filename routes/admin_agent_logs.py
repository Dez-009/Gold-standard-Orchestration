"""Admin endpoint for querying agent execution logs."""

from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.agent_execution_log_service import AgentExecutionLog

# Notes: Router prefix consistent with other admin endpoints
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/agent-logs")
def get_agent_execution_logs(
    user_id: int | None = None,
    agent_name: str | None = None,
    success: bool | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return execution logs filtered by query parameters."""

    # Notes: Begin constructing the query dynamically
    query = db.query(AgentExecutionLog)
    if user_id is not None:
        query = query.filter(AgentExecutionLog.user_id == user_id)
    if agent_name is not None:
        query = query.filter(AgentExecutionLog.agent_name == agent_name)
    if success is not None:
        query = query.filter(AgentExecutionLog.success == success)
    if start_date:
        start = datetime.fromisoformat(start_date)
        query = query.filter(AgentExecutionLog.created_at >= start)
    if end_date:
        end = datetime.fromisoformat(end_date)
        query = query.filter(AgentExecutionLog.created_at <= end)

    # Notes: Apply ordering and pagination
    logs = (
        query.order_by(AgentExecutionLog.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Notes: Convert ORM objects to simple dictionaries
    return [
        {
            "id": str(log.id),
            "user_id": log.user_id,
            "agent_name": log.agent_name,
            "success": log.success,
            "execution_time_ms": log.execution_time_ms,
            "input_prompt": log.input_prompt,
            "response_output": log.response_output,
            "error_message": log.error_message,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]

# Footnote: Exposes admin API for viewing agent execution history.
