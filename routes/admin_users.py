from __future__ import annotations
"""Admin endpoints for managing user records."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from services import user_service
from services import admin_user_service
from models.user import User
from schemas.user_schemas import UserResponse

router = APIRouter(prefix="/admin/users", tags=["admin"])





@router.get("/", response_model=list[UserResponse])
def list_users(
    limit: int = 100,
    offset: int = 0,
    role: str | None = None,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[User]:
    """Return users filtered by role with pagination."""
    return admin_user_service.list_users(db, limit, offset, role)


@router.get("/{user_id}", response_model=UserResponse)
def get_user_details(
    user_id: int,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> User:
    """Return a single user's information."""
    user = user_service.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user



@router.patch("/{user_id}", response_model=UserResponse)
def update_user_role(
    user_id: int,
    role: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> User:
    """Update a user's role."""
    try:
        return admin_user_service.update_user_role(db, user_id, role)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/{user_id}")
def deactivate_user(
    user_id: int,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Soft delete a user account."""
    try:
        admin_user_service.deactivate_user(db, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {"status": "deactivated"}
