"""Unit tests for the feedback service functions."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import feedback_service, user_service
from models.user_feedback import FeedbackType
from tests.conftest import TestingSessionLocal


def test_submit_and_list_feedback():
    """Service should store and retrieve feedback records."""
    db = TestingSessionLocal()
    user = user_service.create_user(
        db,
        {
            "email": f"svc_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    rec = feedback_service.submit_feedback(
        db,
        {"user_id": user.id, "feedback_type": FeedbackType.BUG, "message": "x"},
    )
    results = feedback_service.list_feedback(db)
    assert any(r.id == rec.id for r in results)
    db.close()

