"""Tests for agent execution log service and admin route."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services.agent_execution_log_service import log_agent_execution
from models.agent_execution_log import AgentExecutionLog
from services.user_service import create_user
from tests.conftest import TestingSessionLocal

client = TestClient(app)


# Helper to create a user and return id and token
def register_user(role: str = "user") -> tuple[int, str]:
    email = f"exec_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
        "role": role,
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def test_log_agent_execution_persists():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": "exec@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    log_agent_execution(db, user.id, "career", "hi", "ok", True, 10)
    logs = db.query(AgentExecutionLog).all()
    assert len(logs) == 1
    assert logs[0].agent_name == "career"
    db.close()


def test_admin_can_query_execution_logs():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": "exec2@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    log_agent_execution(db, user.id, "career", "hi", "ok", True, 12)
    db.close()

    _, admin_token = register_user(role="admin")
    resp = client.get(
        "/admin/agent-logs",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)
    assert len(resp.json()) >= 1

# Footnote: Ensures logging logic works and admin endpoint lists records.
