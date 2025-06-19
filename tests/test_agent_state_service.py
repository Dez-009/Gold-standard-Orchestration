"""Tests for the agent state service."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from services import agent_state_service, user_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def create_test_user(db: TestingSessionLocal) -> int:
    """Helper to create a user for tests."""
    user = user_service.create_user(
        db,
        {
            "email": f"state_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    return user.id


def test_set_and_get_agent_state():
    """Verify state records can be saved and retrieved."""
    db = TestingSessionLocal()
    user_id = create_test_user(db)

    # Notes: Create a new state record
    state = agent_state_service.set_agent_state(db, user_id, "career", "active")
    assert state.state == "active"

    # Notes: Update the state and fetch again
    agent_state_service.set_agent_state(db, user_id, "career", "paused")
    fetched = agent_state_service.get_agent_state(db, user_id, "career")
    assert fetched is not None
    assert fetched.state == "paused"

    db.close()


def test_invalid_state_raises():
    """Ensure invalid states raise a ValueError."""
    db = TestingSessionLocal()
    user_id = create_test_user(db)
    try:
        agent_state_service.set_agent_state(db, user_id, "career", "unknown")
        assert False, "Expected ValueError"
    except ValueError:
        pass
    finally:
        db.close()
