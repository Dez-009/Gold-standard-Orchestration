"""Tests for the flagged summaries admin endpoint."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from models.summarized_journal import SummarizedJournal
from tests.conftest import TestingSessionLocal

client = TestClient(app)


def _register_user(role: str = "user") -> tuple[int, str]:
    email = f"flag_{uuid.uuid4().hex}@example.com"
    data = {
        "email": email,
        "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
        "hashed_password": "pw",
        "role": role,
    }
    resp = client.post("/users/", json=data)
    uid = resp.json()["id"]
    token = create_access_token({"user_id": uid})
    return uid, token


def test_admin_lists_flagged_summaries():
    db = TestingSessionLocal()
    user_id, _ = _register_user()
    # Create two flagged summaries and one normal
    s1 = SummarizedJournal(
        user_id=user_id,
        summary_text="bad text",
        flagged=True,
        flag_reason="moderation_violation",
    )
    s2 = SummarizedJournal(
        user_id=user_id,
        summary_text="also bad",
        flagged=True,
        flag_reason="moderation_violation",
    )
    s3 = SummarizedJournal(user_id=user_id, summary_text="ok")
    db.add_all([s1, s2, s3])
    db.commit()
    db.close()

    _, admin_token = _register_user(role="admin")
    resp = client.get(
        "/admin/summaries/flagged",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    assert all(row["flag_reason"] for row in data)

