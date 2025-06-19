"""Test the orchestration journal summary endpoint."""

# Notes: Configure import path and environment variables
import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("ORCHESTRATION_FEATURE", "true")

from main import app
from auth.auth_utils import create_access_token
from services import user_service, journal_service
from models.summarized_journal import SummarizedJournal
from tests.conftest import TestingSessionLocal

client = TestClient(app)


# Notes: Helper to create a user and sample journals
def _setup_user(db):
    user = user_service.create_user(
        db,
        {
            "email": f"orch_sum_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": "admin",
        },
    )
    for i in range(3):
        journal_service.create_journal_entry(
            db, {"user_id": user.id, "content": f"entry {i}"}
        )
    return user


# Notes: Verify that the route summarizes entries and stores a record

def test_orchestration_journal_summary(monkeypatch):
    db = TestingSessionLocal()
    user = _setup_user(db)

    # Notes: Stub the summarizer to avoid external calls
    monkeypatch.setattr(
        "services.orchestration_summarizer.AIModelAdapter.generate",
        lambda *_, **__: "summary",
    )
    monkeypatch.setattr(
        "routes.orchestration_journal_summary.ORCHESTRATION_FEATURE_ENABLED",
        True,
    )

    token = create_access_token({"user_id": user.id, "role": "admin"})
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/orchestration/journal-summary",
        json={"user_id": user.id},
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["summary"] == "summary"

    # Notes: Confirm record persisted
    records = db.query(SummarizedJournal).filter_by(user_id=user.id).all()
    assert len(records) == 1

    db.close()
