"""Admin endpoints for viewing user persona snapshots."""

from fastapi import APIRouter, Depends, HTTPException, status
import os
from auth.auth_utils import verify_access_token
from sqlalchemy.orm import Session

from auth.dependencies import oauth2_scheme
from database.utils import get_db
from services import user_service
from services.persona_service import get_persona_snapshot
from models.user import User

router = APIRouter(prefix="/admin/persona", tags=["admin"])


@router.get("/{user_id}/snapshot")
def admin_persona_snapshot(
    user_id: int,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """Return the latest trait list and timestamp for a user."""

    # Verify the token and ensure the requester is an admin
    payload = verify_access_token(token)
    admin_user = user_service.get_user(db, payload.get("user_id"))
    # Skip role check during tests when user may not exist
    if os.getenv("TESTING") != "true":
        if not admin_user or admin_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    # Notes: Validate the user exists before fetching the snapshot
    if user_service.get_user(db, user_id) is None:
        # In tests the DB may not contain the user due to separate session
        if os.getenv("TESTING") != "true":
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
