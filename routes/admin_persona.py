"""Admin endpoints for viewing user persona snapshots."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from services import user_service
from services.persona_service import get_persona_snapshot
from models.user import User

router = APIRouter(prefix="/admin/persona", tags=["admin"])


@router.get("/{user_id}/snapshot")
def admin_persona_snapshot(
    user_id: int,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return the latest trait list and timestamp for a user."""

    # Notes: Validate the user exists before fetching the snapshot
    if user_service.get_user(db, user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Notes: Delegate to the service for retrieval of snapshot data
    snapshot = get_persona_snapshot(db, user_id)
    if snapshot is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Snapshot not found")

    # Notes: Only expose traits and timestamp to the API consumer
    last_updated = snapshot.get("last_updated")
    return {
        "traits": snapshot["traits"],
        "last_updated": last_updated.isoformat() if last_updated else None,
    }

# Footnote: Admin role only
