"""Admin API endpoints for viewing recent audit logs."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import audit_log_service

# Notes: Router prefix yields routes like /admin/audit-logs
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/audit-logs")
def recent_audit_logs(
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return paginated audit logs for the admin dashboard."""

    # Notes: Retrieve logs ordered by most recent first
    logs = audit_log_service.get_recent_audit_logs(db, limit, offset)

    # Notes: Convert ORM models into simple dictionaries for JSON response
    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat(),
            "user_id": log.user_id,
            "event_type": log.action,
            "details": log.detail,
        }
        for log in logs
    ]

