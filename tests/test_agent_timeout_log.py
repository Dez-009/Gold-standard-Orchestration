"""Tests for the agent timeout logging service."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.agent_timeout_log import log_timeout, get_recent_timeouts
from services.user_service import create_user
from tests.conftest import TestingSessionLocal


def test_log_and_query_timeout():
    """Verify a timeout record is persisted and retrievable."""

    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"timeout_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    log_timeout(db, user.id, "career")
    rows = get_recent_timeouts(db)
    assert len(rows) == 1
    assert rows[0].user_id == user.id
    assert rows[0].agent_name == "career"
    db.close()
