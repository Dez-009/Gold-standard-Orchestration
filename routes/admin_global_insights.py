"""Admin route providing global usage insights."""

from __future__ import annotations

import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services.global_insights_service import get_global_insights

router = APIRouter(prefix="/admin", tags=["admin"])

# Notes: Simple in-memory cache for 5 minutes
_CACHE_TTL = 300
_cached_at = 0.0
_cached_data: dict | None = None


@router.get("/insights/global")
def read_global_insights(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return summarized platform metrics for admins."""
    global _cached_at, _cached_data
    now = time.time()
    if _cached_data is not None and now - _cached_at < _CACHE_TTL:
        return _cached_data
    data = get_global_insights(db)
    _cached_data = data
    _cached_at = now
    return data

