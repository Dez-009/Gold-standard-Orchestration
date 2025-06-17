"""Tests for agent personalization persistence."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

# Notes: Ensure application modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from database.session import SessionLocal, engine
from database.base import Base
from services import agent_personalization_service, user_service

client = TestClient(app)


# Helper to reset database between tests
def setup_db() -> SessionLocal:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()


# Helper to create a user
def create_user(db: SessionLocal):
    return user_service.create_user(
        db,
        {
            "email": f"ap_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )


# Insert then update a personalization profile
def test_insert_update_profile():
    db = setup_db()
    user = create_user(db)

    # Notes: Insert a new profile
    rec1 = agent_personalization_service.set_agent_personality(
        db, user.id, "career", '{"tone":"friendly"}'
    )
    assert rec1.personality_profile == '{"tone":"friendly"}'

    # Notes: Update the existing profile
    rec2 = agent_personalization_service.set_agent_personality(
        db, user.id, "career", '{"tone":"serious"}'
    )
    assert rec2.id == rec1.id
    assert rec2.personality_profile == '{"tone":"serious"}'
    db.close()


# Retrieve profiles via service functions
def test_retrieve_profiles():
    db = setup_db()
    user = create_user(db)
    agent_personalization_service.set_agent_personality(db, user.id, "career", "A")
    agent_personalization_service.set_agent_personality(db, user.id, "health", "B")

    # Notes: Fetch a single agent profile
    single = agent_personalization_service.get_agent_personality(db, user.id, "health")
    assert single.personality_profile == "B"

    # Notes: List all profiles for the user
    all_profiles = agent_personalization_service.list_agent_personalities(db, user.id)
    assert len(all_profiles) == 2
    db.close()
