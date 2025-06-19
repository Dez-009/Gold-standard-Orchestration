from __future__ import annotations

"""Admin routes for managing journal summary notes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.admin_notes_service import get_notes_timeline, add_note


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/summaries/{summary_id}/notes")
def read_notes(
    summary_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return note timeline for the specified summary."""

    return get_notes_timeline(db, UUID(summary_id))


@router.post("/summaries/{summary_id}/notes")
def create_note(
    summary_id: str,
    body: dict,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Add a new admin note to the summary."""

    content = body.get("content")
    if not content:
        raise HTTPException(status_code=400, detail="content required")
    return add_note(db, UUID(summary_id), admin.id, content)

# Footnote: Enables threaded notes for summary moderation.
