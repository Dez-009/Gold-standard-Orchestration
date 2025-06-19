"""Tests for user personality assignment functionality."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Adjust path so the application module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services.user_personality_service import assign_personality
from services.user_service import create_user
from tests.conftest import TestingSessionLocal

client = TestClient(app)


# Helper to create a user and return id and token
def register_and_login() -> tuple[int, str]:
    email = f"pers_{uuid.uuid4().hex}@example.com"
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


# Helper for admin operations
def register_user_with_role(role: str = "user") -> tuple[int, str, str]:
    email = f"pers_{uuid.uuid4().hex}@example.com"
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
    return user_id, token, email


# Verify the service layer stores a personality assignment
def test_assign_personality_service():
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"svc_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    assignment = assign_personality(db, user.id, uuid.uuid4(), "career")
    assert assignment.user_id == user.id
    assert assignment.domain == "career"
    assert assignment.assigned_at is not None
    db.close()


# Ensure the API endpoint creates a record for the authenticated user
def test_assign_personality_endpoint():
    user_id, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.post(
        "/account/assign_personality",
        json={"personality_id": str(uuid.uuid4()), "domain": "health"},
        headers=headers,
    )
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["user_id"] == user_id
    assert data["domain"] == "health"
    assert "assigned_at" in data


# Admin route should create or update assignments for any user
def test_admin_assign_personality():
    target_id, _, _ = register_user_with_role()
    _, admin_token, _ = register_user_with_role(role="admin")
    resp = client.post(
        "/admin/user-personalities",
        json={
            "user_id": target_id,
            "personality_id": str(uuid.uuid4()),
            "domain": "finance",
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["user_id"] == target_id
    assert data["domain"] == "finance"
