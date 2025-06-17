"""Tests for the agent feedback endpoints."""

import os
import sys
from uuid import uuid4
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from tests.conftest import TestingSessionLocal
from models.journal_summary import JournalSummary

client = TestClient(app)


def register_user() -> tuple[int, str]:
    """Create a user and return id and token."""
    email = f"af_{uuid4().hex}@example.com"
    resp = client.post(
        "/users/",
        json={
            "email": email,
            "phone_number": str(int(uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    assert resp.status_code in (200, 201)
    user_id = resp.json()["id"]
    token = create_access_token({"user_id": user_id})
    return user_id, token


def create_summary(user_id: int) -> JournalSummary:
    """Persist a summary for testing."""
    db = TestingSessionLocal()
    try:
        summary = JournalSummary(
            user_id=user_id,
            summary_text="text",
            source_entry_ids="[]",
        )
        db.add(summary)
        db.commit()
        db.refresh(summary)
        return summary
    finally:
        db.close()


def test_create_and_get_feedback():
    """User can submit feedback then retrieve it."""
    user_id, token = register_user()
    summary = create_summary(user_id)

    resp = client.post(
        "/feedback/agent-summary",
        json={"summary_id": str(summary.id), "emoji_reaction": "👍", "feedback_text": "nice"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["emoji_reaction"] == "👍"

    resp_get = client.get(
        f"/feedback/agent-summary/{summary.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp_get.status_code == 200
    assert resp_get.json()["feedback_text"] == "nice"

