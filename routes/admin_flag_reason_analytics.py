"""Admin route exposing flag reason usage statistics."""

from __future__ import annotations

from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.flag_reason_analytics_service import get_flag_reason_usage

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/flag-reason-analytics")
def flag_reason_analytics(
    start: date | None = None,
    end: date | None = None,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return counts of each flag reason used in summaries."""

    results = get_flag_reason_usage(db, start, end)
    return results

# Footnote: Used by the admin dashboard to show reason distribution.
