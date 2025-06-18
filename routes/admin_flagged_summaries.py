"""Admin routes for listing flagged summaries."""

from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.summarized_journal_service import list_flagged_summaries

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

