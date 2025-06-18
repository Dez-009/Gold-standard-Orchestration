"""Tests for the agent flag service."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import agent_flag_service, user_service
from tests.conftest import TestingSessionLocal


def create_user(db: TestingSessionLocal) -> int:
    user = user_service.create_user(
        db,
        {
            "email": f"flag_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pw",
        },
    )
    return user.id


def test_flag_and_review():
    """Ensure flags can be created and reviewed."""
    db = TestingSessionLocal()
    user_id = create_user(db)

    flag = agent_flag_service.flag_agent_output(db, "career", user_id, "bad")
    assert flag.id is not None
    assert not flag.reviewed

    rows = agent_flag_service.list_flags(db, reviewed=False)
    assert any(f.id == flag.id for f in rows)

    updated = agent_flag_service.mark_flag_reviewed(db, str(flag.id))
    assert updated is not None
    assert updated.reviewed
    db.close()
