"""Tests for agent personality assignment router."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Configure environment and import application
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services import personality_service, agent_personality_service, user_service
from tests.conftest import TestingSessionLocal

client = TestClient(app)


# Helper to create a user and auth token
def register_and_login() -> tuple[int, str]:
    email = f"ap_{uuid.uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


# Verify service assigns and retrieves a personality
def test_agent_personality_service():
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
            "name": f"Helper_{uuid.uuid4().hex}",
            "description": "Helps a lot",
            "system_prompt": "You help",
        },
    )
    assignment = agent_personality_service.assign_personality(
        db, user.id, "career", personality.name
    )
    fetched = agent_personality_service.get_personality_assignment(db, user.id, "career")
    assert assignment.id == fetched.id
    assert fetched.personality_id == personality.id
    db.close()


# Endpoint flow covering POST then GET
def test_agent_personality_endpoints():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    # Create personality option via admin-like call
    db = TestingSessionLocal()
    personality = personality_service.create_personality(
        db,
        {
            "name": f"Friendly_{uuid.uuid4().hex}",
            "description": "Nice",
            "system_prompt": "You are nice",
        },
    )
    db.close()

    resp = client.post(
        "/agent/personality-assignments",
        json={"domain": "health", "personality": personality.name},
        headers=headers,
    )
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["user_id"] == user_id
    assert data["domain"] == "health"
    assert data["personality"] == personality.name

    get_resp = client.get(
        "/agent/personality-assignments",
        params={"domain": "health"},
        headers=headers,
    )
    assert get_resp.status_code == 200
    fetched = get_resp.json()
    assert fetched["id"] == data["id"]
    assert fetched["personality"] == personality.name
