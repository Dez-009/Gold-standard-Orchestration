"""Admin API route for querying audit logs with filters."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import audit_log_service

# Notes: Prefix matches other admin routes under /admin
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/audit-logs")
def get_audit_logs(
    user_id: int | None = None,
    agent_name: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return audit logs filtered by the supplied query parameters."""

    # Notes: Collect the filters in a dictionary for the service layer
    filters = {
        "user_id": user_id,
        "agent_name": agent_name,
        "start_date": start_date,
        "end_date": end_date,
        "limit": limit,
        "offset": offset,
    }

    # Notes: Retrieve the log entries from the service
    logs = audit_log_service.get_audit_logs(db, filters)

    # Notes: Convert ORM objects to dictionaries for the response
    return [
        {
            "timestamp": log.timestamp.isoformat(),
            "action_type": log.action,
            "metadata": log.detail,
            "user_id": log.user_id,
        }
        for log in logs
    ]

# Footnote: Exposes filtered audit logs for admin transparency.
