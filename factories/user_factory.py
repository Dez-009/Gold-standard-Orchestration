from __future__ import annotations

"""Factory helpers for user creation in tests."""

from uuid import uuid4
from sqlalchemy.orm import Session
from services import user_service


def create_user(db: Session, **overrides):
    """Create and return a user with randomized defaults."""
    data = {
        "email": f"u_{uuid4().hex}@example.com",
        "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
    }
    data.update(overrides)
    return user_service.create_user(db, data)
