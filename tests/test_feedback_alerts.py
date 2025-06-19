"""Tests for feedback alert logging and retrieval."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from tests.conftest import TestingSessionLocal
from services import user_service
from services.feedback_alert_service import log_alert_if_low_rating
from models.journal_summary import JournalSummary

client = TestClient(app)


def register_user(role: str = "user") -> tuple[int, str]:
    """Create a user via the API and return id and token."""
    email = f"fa_{uuid.uuid4().hex}@example.com"
    resp = client.post(
        "/users/",
        json={
            "email": email,
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
            "role": role,
        },
    )
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def create_summary(user_id: int) -> JournalSummary:
    """Persist a journal summary for the user."""
    db = TestingSessionLocal()
    try:
        summary = JournalSummary(
            user_id=user_id,
            summary_text="bad summary",
            source_entry_ids="[]",
        )
        db.add(summary)
        db.commit()
        db.refresh(summary)
        return summary
    finally:
        db.close()


def test_alert_created_and_listed():
    """Low rating should generate an alert accessible to admins."""
    user_id, _ = register_user()
    summary = create_summary(user_id)
    db = TestingSessionLocal()
    try:
        log_alert_if_low_rating(db, user_id, summary.id, 1)
    finally:
        db.close()

    _, admin_token = register_user(role="admin")
    resp = client.get(
        "/admin/feedback-alerts",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["summary_id"] == str(summary.id)


