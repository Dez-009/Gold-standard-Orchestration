"""Tests for admin agent assignment override functionality."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import agent_override_service, user_service, personality_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


# Helper to register a user with optional role and return id and token
def register_user(role: str = "user") -> tuple[int, str]:
    email = f"ov_{uuid.uuid4().hex}@example.com"
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


def test_create_override_service():
    """Service layer should persist override records."""
    db = TestingSessionLocal()
    user = user_service.create_user(
        db,
        {
            "email": f"svc_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    personality = personality_service.create_personality(
        db,
        {
            "name": f"p_{uuid.uuid4().hex}",
            "description": "test",
            "system_prompt": "hi",
        },
    )
    override = agent_override_service.create_override(db, user.id, str(personality.id))
    assert override.user_id == user.id
    assert str(override.agent_id) == str(personality.id)
    assert override.assigned_at is not None
    db.close()


def test_override_endpoint_schema():
    """API should return serialized override using the response schema."""
    user_id, _ = register_user()
    _, admin_token = register_user("admin")

    # Create an agent personality for override
    db = TestingSessionLocal()
    personality = personality_service.create_personality(
        db,
        {
            "name": f"p_{uuid.uuid4().hex}",
            "description": "test",
            "system_prompt": "hi",
        },
    )
    db.close()

    resp = client.post(
        "/admin/agent-override",
        json={"user_id": user_id, "agent_id": str(personality.id)},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["user_id"] == user_id
    assert data["agent_id"] == str(personality.id)
    assert "assigned_at" in data

