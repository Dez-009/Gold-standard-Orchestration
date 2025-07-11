from __future__ import annotations
"""Admin endpoints for managing user records."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from services import user_service
from models.user import User
from schemas.user_schemas import UserResponse

router = APIRouter(prefix="/admin/users", tags=["admin"])


class AdminUserUpdate(BaseModel):
    """Fields allowed when updating a user."""

    email: str | None = None
    phone_number: str | None = None
    full_name: str | None = None
    age: int | None = None
    sex: str | None = None
    role: str | None = None
    is_active: bool | None = None


@router.get("/", response_model=list[UserResponse])
def list_users(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[User]:
    """Return every user account."""
    return user_service.get_all_users(db)


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


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    payload: AdminUserUpdate,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> User:
    """Modify user attributes."""
    user = user_service.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updated = user_service.update_user(db, user, payload.model_dump(exclude_none=True))
    return updated
