import os
import sys
from datetime import datetime
import uuid

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from services import user_service
from services.segmentation_service import create_segment, evaluate_segment
from models.subscription import Subscription
from models.user_session import UserSession
from models.personality import Personality
from models.user_personality import UserPersonality
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def create_user(db):
    return user_service.create_user(
        db,
        {
            "email": f"seg_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )


def test_segment_subscription_filter():
    db = TestingSessionLocal()
    user = create_user(db)
    db.add(
        Subscription(
            user_id=user.id,
            stripe_subscription_id="sub_1",
            status="active",
            created_at=datetime.utcnow(),
        )
    )
    db.commit()

    seg = create_segment(
        db,
        {
            "name": "active",
            "criteria": {"subscription_status": "active"},
        },
    )

    users = evaluate_segment(db, seg.id)
    ids = {u.id for u in users}
    assert user.id in ids
    db.close()


def test_segment_personality_and_sessions():
    db = TestingSessionLocal()
    user = create_user(db)
    personality = Personality(name="test", description="", system_prompt="")
    db.add(personality)
    db.flush()
    db.add(
        UserPersonality(
            user_id=user.id,
            personality_id=personality.id,
            domain="career",
            assigned_at=datetime.utcnow(),
        )
    )
    db.add(UserSession(user_id=user.id, session_start=datetime.utcnow()))
    db.commit()

    seg = create_segment(
        db,
        {
            "name": "combo",
            "criteria": {
                "personality_type": "test",
                "min_sessions": 1,
            },
        },
    )

    users = evaluate_segment(db, seg.id)
    ids = {u.id for u in users}
    assert user.id in ids
    db.close()
