"""Admin routes for moderating summarized journals."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.summarized_journal_service import flag_summary, unflag_summary
from services.audit_log_service import create_audit_log

router = APIRouter(prefix="/admin/summaries", tags=["admin"])


@router.post("/{summary_id}/flag")
def admin_flag_summary(
    summary_id: str,
    body: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Flag a summary for review with an optional reason."""

    reason = body.get("reason", "")
    summary = flag_summary(db, UUID(str(summary_id)), reason)
    if summary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    create_audit_log(db, {"user_id": summary.user_id, "action": "summary_flagged", "detail": reason})
    return {"status": "flagged", "summary_id": str(summary.id)}


@router.post("/{summary_id}/unflag")
def admin_unflag_summary(
    summary_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Remove a moderation flag from a summary."""

    summary = unflag_summary(db, UUID(str(summary_id)))
    if summary is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found")
    create_audit_log(db, {"user_id": summary.user_id, "action": "summary_unflagged", "detail": None})
    return {"status": "unflagged", "summary_id": str(summary.id)}

# Footnote: Enables admins to control visibility of journal summaries.
