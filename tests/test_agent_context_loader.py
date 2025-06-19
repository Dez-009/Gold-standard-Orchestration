"""Tests for the agent context loader service."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.agent_context_loader import load_agent_context, is_agent_active
from services import agent_state_service, user_service
from models.agent_state import AgentState, AgentStateStatus
from tests.conftest import TestingSessionLocal


def create_user(db: TestingSessionLocal) -> int:
    """Helper to create a test user."""
    user = user_service.create_user(
        db,
        {
            "email": f"ctx_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password",
        },
    )
    return user.id


def test_load_all_active():
    """Return all agent names when every state is active."""
    db = TestingSessionLocal()
    user_id = create_user(db)
    agent_state_service.set_agent_state(db, user_id, "career", AgentStateStatus.ACTIVE.value)
    agent_state_service.set_agent_state(db, user_id, "health", AgentStateStatus.ACTIVE.value)
    agent_state_service.set_agent_state(db, user_id, "finance", AgentStateStatus.ACTIVE.value)
    active = load_agent_context(db, user_id)
    assert set(active) == {"career", "health", "finance"}
    db.query(AgentState).delete()
    db.commit()
    db.close()


def test_load_with_paused_and_suspended():
    """Exclude agents that are not active."""
    db = TestingSessionLocal()
    user_id = create_user(db)
    agent_state_service.set_agent_state(db, user_id, "career", AgentStateStatus.ACTIVE.value)
    agent_state_service.set_agent_state(db, user_id, "health", AgentStateStatus.PAUSED.value)
    agent_state_service.set_agent_state(db, user_id, "finance", AgentStateStatus.SUSPENDED.value)
    active = load_agent_context(db, user_id)
    assert active == ["career"]
    assert is_agent_active(db, user_id, "career")
    assert not is_agent_active(db, user_id, "health")
    db.query(AgentState).delete()
    db.commit()
    db.close()


def test_load_missing_records():
    """Fallback behavior when no states exist for the user."""
    db = TestingSessionLocal()
    user_id = create_user(db)
    active = load_agent_context(db, user_id)
    assert active == []
    assert is_agent_active(db, user_id, "career")
    db.query(AgentState).delete()
    db.commit()
    db.close()

# Footnote: Validates agent context retrieval logic.
