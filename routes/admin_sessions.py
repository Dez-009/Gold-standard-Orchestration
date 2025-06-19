"""Admin route exposing recent user sessions."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import user_session_service

# Notes: Prefix ensures routes appear under /admin
router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/user-sessions")
def list_user_sessions(
    limit: int = 100,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return recent user login sessions for admin monitoring."""

    # Notes: Fetch sessions ordered by most recent first
    sessions = user_session_service.get_recent_sessions(db, limit=limit)
    # Notes: Convert ORM objects into simple dictionaries
    return [
        {
            "user_id": s.user_id,
            "session_start": s.session_start.isoformat(),
            "session_end": s.session_end.isoformat() if s.session_end else None,
            "total_duration": s.total_duration,
        }
        for s in sessions
    ]
