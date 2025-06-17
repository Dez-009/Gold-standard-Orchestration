"""Admin routes for viewing AI summarized journal entries."""

from __future__ import annotations

# Notes: Import FastAPI routing utilities and dependency injection helpers
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Notes: Reuse admin authentication dependency
from auth.dependencies import get_current_admin_user
# Notes: Database session provider used across route functions
from database.utils import get_db
# Notes: User model only for dependency typing
from models.user import User

# Notes: Service layer encapsulating query logic for summaries
from services.admin_summarized_journal_service import (
    get_summarized_journals,
    get_summary_by_id,
    update_admin_notes,
)

# Notes: Prefix registers the route under /admin
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/summarized-journals")
# Notes: Endpoint returning paginated summarized journals for audit
def list_summarized_journals(
    user_id: int | None = None,
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return a list of summarized journal entries."""
    return get_summarized_journals(db, user_id, limit, offset)


@router.get("/journal-summaries/{summary_id}")
def get_journal_summary(
    summary_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return a single summarized journal including admin notes."""

    result = get_summary_by_id(db, summary_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Summary not found")
    return result


@router.patch("/journal-summaries/{summary_id}/notes")
def set_admin_notes(
    summary_id: str,
    body: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Update admin notes on a summarized journal and return the record."""

    notes = body.get("notes", "")
    result = update_admin_notes(db, summary_id, notes)
    if result is None:
        raise HTTPException(status_code=404, detail="Summary not found")
    return result

# Footnote: Used by the internal moderation dashboard.
