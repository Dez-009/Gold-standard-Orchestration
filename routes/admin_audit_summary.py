from __future__ import annotations
"""Admin API route exposing the audit trail for a journal summary."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.audit_log_service import get_summary_audit_trail

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/summaries/{summary_id}/audit")
def summary_audit_route(
    summary_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return the audit events for the requested summary."""
    logs = get_summary_audit_trail(db, summary_id)
    return [
        {
            "timestamp": log.timestamp.isoformat(),
            "event_type": log.event_type or log.action,
            "actor": (log.metadata_json or {}).get("admin_id"),
            "metadata": log.metadata_json or {},
        }
        for log in logs
    ]
