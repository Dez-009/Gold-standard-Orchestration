"""Admin route for re-running a specific journal summary."""

from __future__ import annotations

# Notes: FastAPI utilities for routing and dependency injection
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Notes: Import admin authentication dependency and DB session provider
from auth.dependencies import get_current_admin_user
from database.utils import get_db

# Notes: User model only used for dependency typing
from models.user import User
from models.summarized_journal import SummarizedJournal

# Notes: Service that performs the rerun operation
from services.agent_rerun_service import rerun_summary

from uuid import UUID

# Notes: Prefix routes under the /admin namespace
router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/journal-summaries/{summary_id}/rerun")
# Notes: Only admins are allowed to trigger a rerun
def rerun_summary_endpoint(
    summary_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Regenerate a journal summary using its original context."""

    # Notes: Ensure a valid UUID and locate the existing record
    sid = UUID(str(summary_id))
    summary = db.query(SummarizedJournal).get(sid)
    if summary is None:
        raise HTTPException(status_code=404, detail="Summary not found")

    # Notes: Delegate the heavy lifting to the service layer
    updated = rerun_summary(db, sid)

    # Notes: Return the updated summary record to the caller
    return {
        "id": str(updated.id),
        "user_id": updated.user_id,
        "summary_text": updated.summary_text,
        "created_at": updated.created_at.isoformat(),
        "admin_notes": updated.admin_notes,
    }

# Footnote: Allows administrators to refresh journal summaries on demand.
