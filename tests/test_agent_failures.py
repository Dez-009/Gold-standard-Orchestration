"""Tests for the agent failure service."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from services import agent_failure_service, user_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def create_test_user(db: TestingSessionLocal) -> int:
    """Helper to create a user for failure queue tests."""
    user = user_service.create_user(
        db,
        {
            "email": f"fail_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    return user.id


def clear_queue(db: TestingSessionLocal) -> None:
    """Remove all failure queue entries to isolate tests."""
    db.query(agent_failure_service.AgentFailureQueue).delete()
    db.commit()


def test_add_failure_to_queue():
    """Verify a failure record can be added."""
    db = TestingSessionLocal()
    clear_queue(db)
    user_id = create_test_user(db)

    entry = agent_failure_service.add_failure_to_queue(
        db, user_id, "career", "timeout"
    )
    assert entry.user_id == user_id
    assert entry.agent_name == "career"
    assert entry.failure_reason == "timeout"
    assert entry.retry_count == 0
    db.close()


def test_increment_retry_count():
    """Ensure retry count increments correctly."""
    db = TestingSessionLocal()
    clear_queue(db)
    user_id = create_test_user(db)
    entry = agent_failure_service.add_failure_to_queue(
        db, user_id, "career", "timeout"
    )

    updated = agent_failure_service.increment_retry_count(db, entry)
    assert updated.retry_count == 1
    db.close()


def test_process_failure_queue_moves_when_exceeded():
    """Processing should remove entry when retries exceed max."""
    db = TestingSessionLocal()
    clear_queue(db)
    user_id = create_test_user(db)
    entry = agent_failure_service.add_failure_to_queue(
        db, user_id, "career", "timeout"
    )
    entry.max_retries = 1
    db.commit()

    agent_failure_service.process_failure_queue(db)
    remaining = db.query(agent_failure_service.AgentFailureQueue).all()
    assert len(remaining) == 0
    db.close()
