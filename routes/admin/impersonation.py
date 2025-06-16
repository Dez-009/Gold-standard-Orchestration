from __future__ import annotations

"""Admin routes for user impersonation functionality."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from auth.dependencies import get_current_admin_user
from auth.auth_utils import create_access_token
from database.utils import get_db
from services import user_service, audit_log_service
from models.user import User

router = APIRouter(prefix="/admin/impersonation", tags=["admin"])


class ImpersonationRequest(BaseModel):
    """Schema for requesting a new impersonation token."""

    user_id: int


@router.get("/users")
def list_users(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict[str, str | int]]:
    """Return a minimal list of users that can be impersonated."""
    users = user_service.get_all_users(db)
    return [{"id": u.id, "email": u.email} for u in users]


@router.post("/token")
def create_impersonation_token(
    req: ImpersonationRequest,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    """Generate a JWT token representing the target user."""
    user = user_service.get_user(db, req.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    token = create_access_token({"user_id": user.id, "role": user.role, "email": user.email})

    audit_log_service.create_audit_log(
        db,
        {
            "user_id": admin.id,
            "action": "impersonation",
            "detail": f"Impersonated user {user.id}",
        },
    )
    return {"token": token}
