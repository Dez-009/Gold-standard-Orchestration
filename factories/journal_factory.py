from __future__ import annotations

"""Factories for journal objects in tests."""

from uuid import uuid4
from sqlalchemy.orm import Session
from services import journal_service


def create_journal(db: Session, user_id: int, **overrides):
    """Create and return a journal entry linked to ``user_id``."""
    data = {
        "user_id": user_id,
        "content": overrides.pop("content", f"Entry {uuid4().hex}"),
    }
    data.update(overrides)
    return journal_service.create_journal_entry(db, data)
