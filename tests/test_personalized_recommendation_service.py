"""Tests for the goal recommendation service."""

import os
import sys
import uuid
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.personalized_recommendation_service import generate_goals_for_segment
from services.segmentation_service import create_segment
from services.user_service import create_user
from models.goal import Goal
from tests.conftest import TestingSessionLocal


# Verify goals are created for all users in a segment

def test_generate_goals(monkeypatch):
    db: Session = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"g_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    segment = create_segment(db, {"name": "all"})

    # Stub the AI adapter to avoid external calls
    class FakeAdapter:
        def __init__(self, *_):
            pass

        def generate(self, *_args, **_kw):
            return '{"goals": ["goal1", "goal2", "goal3"]}'

    import services.personalized_recommendation_service as svc

    monkeypatch.setattr(svc, "AIModelAdapter", FakeAdapter)
    monkeypatch.setattr(svc, "evaluate_segment", lambda _db, _sid: [user])

    goals = generate_goals_for_segment(db, segment.id)
    user_goals = db.query(Goal).filter(Goal.user_id == user.id).all()
    assert len(goals) == 3
    assert len(user_goals) == 3
    db.close()
