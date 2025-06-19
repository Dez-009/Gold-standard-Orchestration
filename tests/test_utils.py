"""Shared utilities for test setup."""

from __future__ import annotations

import uuid
from sqlalchemy.orm import Session

from services import user_service, journal_service


def create_user(db: Session, **overrides) -> int:
    """Create and return a user id for tests."""
    data = {
        "email": f"t_{uuid.uuid4().hex}@example.com",
        "phone_number": "0000000000",
        "hashed_password": "password123",
    }
    data.update(overrides)
    return user_service.create_user(db, data).id


def create_journal(db: Session, user_id: int, **overrides) -> int:
    """Create a journal entry for ``user_id``."""
    payload = {"content": "test content", "title": None}
    payload.update(overrides)
    return journal_service.create_journal_entry(db, user_id, payload).id


class FakeAgent:
    """Simple fake agent for tests."""

    name = "fake"

    async def run(self, *args, **kwargs) -> str:  # pragma: no cover - simple stub
        return "ok"
