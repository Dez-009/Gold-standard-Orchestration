"""Tests for account personalization routes."""

# Notes: Configure import path and environment for test execution
import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from database.session import SessionLocal, engine
from database.base import Base


client = TestClient(app)


# Helper to initialize a fresh database
def setup_db() -> SessionLocal:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()


# Helper to create a user record

# Helper to register a user via the API
def create_user_via_api() -> tuple[int, str]:
    email = f"p_{uuid.uuid4().hex}@example.com"
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


# Verify retrieval, insert and update of profiles
def test_personalization_flow():
    db = setup_db()
    user_id, token = create_user_via_api()
    headers = {"Authorization": f"Bearer {token}"}

    # Notes: Initial call should return empty profile list
    resp = client.get("/account/personalizations", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data.get("agents"), list)
    assert data["profiles"] == []

    # Notes: Insert a new personalization record
    payload = {"agent_name": "career", "personality_profile": "{\"tone\":\"kind\"}"}
    resp = client.post("/account/personalizations/update", json=payload, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["agent_name"] == "career"

    # Notes: Retrieve profiles again and expect one entry
    resp = client.get("/account/personalizations", headers=headers)
    assert resp.status_code == 200
    profiles = resp.json()["profiles"]
    assert len(profiles) == 1
    assert profiles[0]["personality_profile"] == "{\"tone\":\"kind\"}"

    # Notes: Update the existing personalization
    payload = {"agent_name": "career", "personality_profile": "{\"tone\":\"serious\"}"}
    resp = client.post("/account/personalizations/update", json=payload, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["personality_profile"] == "{\"tone\":\"serious\"}"

    db.close()

