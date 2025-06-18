"""Admin routes for listing flagged summaries."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.summarized_journal_service import (
    list_flagged_summaries,
    flag_summary,
    unflag_summary,
)
from services import audit_log_service

router = APIRouter(prefix="/admin/summaries", tags=["admin"])


@router.get("/flagged")
def get_flagged_summaries(
    user_id: int | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return summaries marked as flagged for moderation."""

    start = datetime.fromisoformat(date_from) if date_from else None
    end = datetime.fromisoformat(date_to) if date_to else None

    rows = list_flagged_summaries(
        db,
        {
            "user_id": user_id,
            "date_from": start,
            "date_to": end,
        },
        limit=limit,
        offset=offset,
    )
    return rows


@router.post("/{summary_id}/flag")
def flag_summary_route(
    summary_id: str,
    body: dict,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Manually flag a summary for moderation review."""

    reason = body.get("reason", "")
    result = flag_summary(db, summary_id, reason)
    if result is None:
        raise HTTPException(status_code=404, detail="Summary not found")
    audit_log_service.log_event(
        db,
        summary_id,
        "flag",
        {"user_id": result["user_id"], "admin_id": admin.id, "reason": reason},
    )
    return result


@router.post("/{summary_id}/unflag")
def unflag_summary_route(
    summary_id: str,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Remove the moderation flag from a summary."""

    result = unflag_summary(db, summary_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Summary not found")
    audit_log_service.log_event(
        db,
        summary_id,
        "unflag",
        {"user_id": result["user_id"], "admin_id": admin.id},
    )
    return result

