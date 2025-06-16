"""Admin endpoints for managing user personality assignments."""

# Notes: FastAPI utilities for routing and dependency management
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from services import user_service, user_personality_service
from models.user import User
from schemas.user_personality_schemas import (
    AdminUserPersonalityRequest,
    UserPersonalityResponse,
)

# Notes: Expose endpoints under /admin/user-personalities
router = APIRouter(prefix="/admin/user-personalities", tags=["admin"])


@router.get("/")
def list_personality_assignments(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return all personality assignments with user emails."""
    return user_personality_service.list_assignments(db)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=UserPersonalityResponse)
def assign_personality_to_user(
    payload: AdminUserPersonalityRequest,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> UserPersonalityResponse:
    """Assign a personality to the given user and domain."""
    # Notes: Validate the target user exists before creation
    user = user_service.get_user(db, payload.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Notes: Delegate to the service for persistence and auditing
    assignment = user_personality_service.create_or_update_assignment(
        db,
        admin_user.id,
        payload.user_id,
        payload.personality_id,
        payload.domain,
    )
    return assignment
