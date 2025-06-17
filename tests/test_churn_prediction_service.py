import os
import sys
import uuid
import json
from datetime import datetime

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from services import user_service, user_session_service, churn_prediction_service
from models.subscription import Subscription
from models.journal_entry import JournalEntry
from models.goal import Goal
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def create_user(db):
    return user_service.create_user(
        db,
        {
            "email": f"churn_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )


def test_high_churn_score():
    """User lacking activity should have max churn risk."""
    db = TestingSessionLocal()
    user = create_user(db)
    score = churn_prediction_service._score_for_user(db, user)
    assert score.churn_risk == 1.0
    assert json.loads(score.reasons) == [
        "no_recent_logins",
        "low_journal_activity",
        "low_goal_progress",
        "inactive_subscription",
    ]
    db.close()


def test_low_churn_score():
    """Engaged user with active sub should have minimal risk."""
    db = TestingSessionLocal()
    user = create_user(db)
    now = datetime.utcnow()

    # Notes: Add subscription and activity for all factors
    db.add(
        Subscription(
            user_id=user.id,
            stripe_subscription_id=str(uuid.uuid4()),
            status="active",
            created_at=now,
        )
    )
    db.add(JournalEntry(user_id=user.id, content="hi", created_at=now))
    db.add(JournalEntry(user_id=user.id, content="bye", created_at=now))
    user_session_service.start_session(db, user.id, None, None)
    db.add(Goal(user_id=user.id, title="g", is_completed=True, created_at=now, updated_at=now))
    db.commit()

    score = churn_prediction_service._score_for_user(db, user)
    assert score.churn_risk == 0.0
    assert score.reasons is None
    db.close()
