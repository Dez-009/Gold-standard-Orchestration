"""Tests for the ReflectionBoosterAgent and prompt service."""

import os
import sys
from uuid import uuid4

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from agents import reflection_booster_agent
from services import reflection_prompt_service
from models.user import User
from main import app
from auth.auth_utils import create_access_token
from fastapi.testclient import TestClient
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def register_user() -> tuple[int, str]:
    """Create a user and return id and token."""

    email = f"reflect_{uuid4().hex}@example.com"
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


def test_generate_reflection_prompt_text():
    """Agent should return a non-empty string question."""
    def fake_generate(_msgs, temperature=0.6):
        return "What made you feel this way today?"

    # Notes: Patch the adapter to avoid external API calls
    original = reflection_booster_agent.adapter.generate
    reflection_booster_agent.adapter.generate = fake_generate
    try:
        text = reflection_booster_agent.generate_reflection_prompt(
            "I felt great today",
            "happy",
            ["run"],
            db=TestingSessionLocal(),
            user_id=1,
        )
        assert isinstance(text, str)
        assert text
    finally:
        reflection_booster_agent.adapter.generate = original


def test_service_create_and_fetch():
    """Creating a prompt should persist and then be retrievable."""

    db = TestingSessionLocal()
    user_id, _ = register_user()
    prompt = reflection_prompt_service.create_prompt(db, user_id, 1, "How are you?")
    assert prompt.user_id == user_id
    prompts = reflection_prompt_service.get_prompts_by_user(db, user_id)
    assert len(prompts) == 1
    assert prompts[0].prompt_text == "How are you?"
    db.close()
