"""Tests for agent state service and admin routes."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from fastapi.testclient import TestClient
from auth.auth_utils import create_access_token
from main import app
from services import agent_state_service, user_service
from models.agent_state import AgentStateStatus
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def create_user(db: TestingSessionLocal, role: str = "user") -> int:
    """Helper to create test users."""
    user = user_service.create_user(
        db,
        {
            "email": f"state_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
            "role": role,
        },
    )
    return user.id


def test_admin_list_and_update():
    """Verify admin can list and update agent states."""
    db = TestingSessionLocal()
    user_id = create_user(db)
    admin_id = create_user(db, "admin")
    agent_state_service.set_agent_state(db, user_id, "career", AgentStateStatus.ACTIVE.value)

    token = create_access_token({"user_id": admin_id})
    resp = client.get(
        "/admin/agent-states",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    update_resp = client.post(
        "/admin/agent-states/update",
        json={"user_id": user_id, "agent_name": "career", "state": "paused"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["state"] == "paused"

    state = agent_state_service.get_agent_state(db, user_id, "career")
    assert state.state == AgentStateStatus.PAUSED
    db.close()


def test_invalid_transition_raises():
    """Ensure invalid state transitions are rejected."""
    db = TestingSessionLocal()
    user_id = create_user(db)
    agent_state_service.set_agent_state(db, user_id, "career", AgentStateStatus.RETIRED.value)
    try:
        agent_state_service.set_agent_state(db, user_id, "career", AgentStateStatus.ACTIVE.value)
        assert False, "Expected ValueError"
    except ValueError:
        pass
    finally:
        db.close()
