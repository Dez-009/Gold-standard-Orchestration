"""Admin user management service functions."""

from __future__ import annotations

from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from models.user import User
from services import audit_log_service, user_service

# Allowed roles in the system
ALLOWED_ROLES = {"user", "beta_tester", "pro_user", "admin"}


def list_users(db: Session, limit: int = 100, offset: int = 0, role: str | None = None) -> List[User]:
    """Return users filtered by role with pagination."""
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(offset).limit(limit).all()


def update_user_role(db: Session, user_id: int | UUID, new_role: str) -> User:
    """Update a user's role and audit the change."""
    if new_role not in ALLOWED_ROLES:
        raise ValueError("invalid role")

    user = user_service.get_user(db, int(user_id))
    if user is None:
        raise ValueError("user not found")

    old_role = user.role
    user.role = new_role
    db.commit()
    db.refresh(user)

    audit_log_service.create_audit_log(
        db,
        {
            "user_id": user.id,
            "action": "ROLE_UPDATE",
            "detail": f"{old_role}->{new_role}",
        },
    )
    return user


def deactivate_user(db: Session, user_id: int | UUID) -> User:
    """Soft delete a user by marking them inactive."""
    user = user_service.get_user(db, int(user_id))
    if user is None:
        raise ValueError("user not found")

    user.is_active = False
    db.commit()
    db.refresh(user)

    audit_log_service.create_audit_log(
        db,
        {
            "user_id": user.id,
            "action": "DEACTIVATE_USER",
            "detail": "soft delete",
        },
    )
    return user
