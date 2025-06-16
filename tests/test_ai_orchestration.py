"""Tests for the AI orchestration service and route."""

# Notes: Ensure the project root is importable and environment variables exist
import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services.user_service import create_user
from services.agent_assignment_service import assign_agent
import services.agent_orchestration_service as orchestration
from tests.conftest import TestingSessionLocal

client = TestClient(app)


# Helper to create a user and return id and JWT token
def register_and_login(domain: str) -> tuple[int, str]:
    import uuid

    email = f"orchestrate_{uuid.uuid4().hex}@example.com"
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": email,
            "phone_number": str(uuid.uuid4().int)[:10],
            "hashed_password": "password123",
        },
    )
    assign_agent(db, user.id, domain)
    user_id = user.id
    db.close()
    token = create_access_token({"user_id": user_id})
    return user_id, token


# Validate that the service routes the prompt to the correct agent

def test_route_ai_request_selects_agent(monkeypatch):
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": "svc@example.com",
            "phone_number": str(uuid.uuid4().int)[:10],
            "hashed_password": "password123",
        },
    )
    assign_agent(db, user.id, "career")

    def fake_career(prompt: str, context: str) -> str:
        return "career reply"

    monkeypatch.setattr(orchestration, "call_career_agent", fake_career)
    monkeypatch.setitem(orchestration.AGENT_HANDLERS, "career", fake_career)

    result = orchestration.route_ai_request(db, user.id, "help me")
    assert result["agent"] == "career"
    assert result["response"] == "career reply"
    db.close()


# Validate that the API route returns the orchestrated response

def test_orchestrate_route(monkeypatch):
    user_id, token = register_and_login("health")

    def fake_health(prompt: str, context: str) -> str:
        return "stay hydrated"

    monkeypatch.setattr(orchestration, "call_health_agent", fake_health)
    monkeypatch.setitem(orchestration.AGENT_HANDLERS, "health", fake_health)

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post("/ai/orchestrate", json={"prompt": "tips"}, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["agent"] == "health"
    assert data["response"] == "stay hydrated"
