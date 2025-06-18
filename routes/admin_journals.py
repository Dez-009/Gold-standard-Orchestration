"""Admin API routes for listing journal entries."""

from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.admin_journal_service import get_journals

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/journals")
# Notes: Return journals filtered by user id and source flag
def list_journals(
    user_id: int | None = None,
    ai_only: bool | None = None,
    limit: int = 100,
    offset: int = 0,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return a list of journal entries for admin review."""

    return get_journals(db, user_id, ai_only, limit, offset)

