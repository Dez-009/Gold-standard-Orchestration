"""Admin endpoints for viewing audit logs."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import audit_log_service


# Notes: Router prefix groups all admin audit endpoints under /admin/audit
router = APIRouter(prefix="/admin/audit", tags=["admin"])


@router.get("/logs")
def list_audit_logs(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return every audit log entry with related user email."""
    # Notes: Fetch all log records from the database
    logs = audit_log_service.get_all_audit_logs(db)
    results: list[dict] = []
    # Notes: Convert ORM objects into serialisable dictionaries
    for log in logs:
        results.append(
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "user_email": log.user.email if log.user else None,
                "action": log.action,
                "detail": getattr(log, "detail", None),
                "ip_address": getattr(log, "ip_address", None),
            }
        )
    return results

