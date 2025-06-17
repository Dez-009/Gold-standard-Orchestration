"""Routes exposing conflict flag retrieval and updates."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user, get_current_admin_user
from database.utils import get_db
from services import conflict_resolution_service
from schemas.conflict_flag import ConflictFlagResponse
from models.user import User

router = APIRouter(prefix="/conflict-flags", tags=["conflict-flags"])


@router.get("/user/{user_id}", response_model=list[ConflictFlagResponse])
# Notes: Return all conflict flags for the given user
def list_flags(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ConflictFlagResponse]:
    """Return unresolved and resolved flags for the user."""

    if user_id != current_user.id:
        return []
    return conflict_resolution_service.get_conflict_flags(db, user_id)


@router.patch("/{flag_id}/resolve", response_model=ConflictFlagResponse)
# Notes: Mark a specific flag as resolved
def resolve_flag(
    flag_id: str,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConflictFlagResponse:
    """Update the flag to resolved state."""

    flag = conflict_resolution_service.mark_flag_resolved(db, flag_id)
    if flag is None:
        raise HTTPException(status_code=404, detail="Flag not found")
    return flag


@router.get("/admin", response_model=list[ConflictFlagResponse])
# Notes: Admin endpoint listing unresolved conflict flags
def admin_list(
    resolved: bool | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin_user),
) -> list[ConflictFlagResponse]:
    """Return flags filtered by resolution status."""

    rows = conflict_resolution_service.get_conflict_flags(db, user_id=None)
    if resolved is not None:
        rows = [r for r in rows if r.resolved == resolved]
    return rows

# Footnote: These routes support user reflection and admin monitoring.
