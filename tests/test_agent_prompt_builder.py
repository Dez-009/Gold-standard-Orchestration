"""Tests for the agent prompt builder utility."""

import os
import sys
import uuid

# Notes: Ensure application modules are importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import agent_prompt_builder, agent_personalization_service, user_service
from tests.conftest import TestingSessionLocal


# Helper to create a user for testing

def create_user(db):
    return user_service.create_user(
        db,
        {
            "email": f"apb_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )


# Verify prompt assembly when a personalization profile exists

def test_build_with_personalization():
    db = TestingSessionLocal()
    user = create_user(db)
    agent_personalization_service.set_agent_personality(
        db,
        user.id,
        "career",
        '{"tone":"cheerful","style":"concise"}',
    )
    result = agent_prompt_builder.build_personalized_prompt(
        db, user.id, "career", "Help me"
    )
    assert result.startswith("Use a cheerful tone. Respond in a concise style.")
    db.close()


# Verify base prompt is returned when no personalization exists

def test_build_without_personalization():
    db = TestingSessionLocal()
    user = create_user(db)
    prompt = "What should I do?"
    result = agent_prompt_builder.build_personalized_prompt(
        db, user.id, "career", prompt
    )
    assert result == prompt
    db.close()


# Verify invalid agent names raise an error

def test_build_invalid_agent():
    db = TestingSessionLocal()
    user = create_user(db)
    try:
        agent_prompt_builder.build_personalized_prompt(db, user.id, "unknown", "Hi")
        assert False, "Expected ValueError"
    except ValueError:
        pass
    finally:
        db.close()
