"""Admin routes for viewing AI summarized journal entries."""

from __future__ import annotations

# Notes: Import FastAPI routing utilities and dependency injection helpers
from fastapi import APIRouter, Depends
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

# Footnote: Used by the internal moderation dashboard.
