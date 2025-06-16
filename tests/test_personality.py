"""Tests for personality API endpoints."""

import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

# Ensure environment variables are set before importing the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token

client = TestClient(app)


def register_and_login() -> tuple[int, str]:
    """Create a user and return id plus auth token."""
    email = f"personality_{uuid4().hex}@example.com"
    user_data = {
        "email": email,
        "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "password123",
    }
    resp = client.post("/users/", json=user_data)
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def test_create_personality():
    """Ensure a personality can be created."""
    _, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    personality_data = {
        "name": "Friendly",
        "description": "Warm and supportive",
        "system_prompt": "You are a friendly coach"
    }
    resp = client.post("/personalities/", json=personality_data, headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()
    assert data["name"] == "Friendly"
    assert "id" in data


def test_get_personalities():
    """Verify listing personalities returns previously created entries."""
    _, token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    # Create one personality to ensure list is not empty
    personality_data = {
        "name": f"Helper_{uuid4().hex}",
        "description": "Helps with tasks",
        "system_prompt": "You are helpful"
    }
    create_resp = client.post("/personalities/", json=personality_data, headers=headers)
    assert create_resp.status_code in (200, 201)

    list_resp = client.get("/personalities/")
    assert list_resp.status_code == 200
    personalities = list_resp.json()
    assert isinstance(personalities, list)
    assert any(p["id"] == create_resp.json()["id"] for p in personalities)

