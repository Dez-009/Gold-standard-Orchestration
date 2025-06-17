"""Tests for the orchestration decision logic service."""

# Notes: Configure import path and environment variables for test isolation
import os
import sys
from uuid import uuid4

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

# Notes: Import the service under test and helpers to create context
from services.orchestration_decision_service import determine_agent_flow
from services import user_service, journal_service, goal_service
from tests.conftest import TestingSessionLocal


# Notes: Helper that seeds a user with minimal related data

def _create_user_with_data(db):
    user = user_service.create_user(
        db,
        {
            "email": f"dec_{uuid4().hex}@example.com",
            "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    journal_service.create_journal_entry(db, {"user_id": user.id, "content": "note"})
    goal_service.create_goal(db, {"user_id": user.id, "title": "Goal", "description": ""})
    return user


# Notes: Validate career keyword triggers the career agent only

def test_determine_agent_flow_career():
    db = TestingSessionLocal()
    user = _create_user_with_data(db)
    agents = determine_agent_flow(db, user.id, "I need career advice")
    assert agents == ["career"]
    db.close()


# Notes: Validate multiple keywords return multiple agents

def test_determine_agent_flow_multi():
    db = TestingSessionLocal()
    user = _create_user_with_data(db)
    agents = determine_agent_flow(db, user.id, "tips on finance and health")
    assert agents == ["finance", "health"]
    db.close()


# Notes: Validate fallback when no keywords are detected

def test_determine_agent_flow_default():
    db = TestingSessionLocal()
    user = _create_user_with_data(db)
    agents = determine_agent_flow(db, user.id, "hello world")
    assert agents == ["general_coach"]
    db.close()
