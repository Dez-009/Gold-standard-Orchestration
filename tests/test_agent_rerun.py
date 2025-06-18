"""Tests for admin journal summary rerun functionality."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services.user_service import create_user
from services import agent_rerun_service
from models.summarized_journal import SummarizedJournal
from tests.conftest import TestingSessionLocal, engine
from database.base import Base

client = TestClient(app)


def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


# Patch the summarization service so no external API calls occur
class Dummy:
    @staticmethod
    def summarize(user_id: int, db):
        return "new summary"


def test_rerun_service_updates_summary(monkeypatch):
    db = setup_db()
    user = create_user(
        db,
        {
            "email": f"rr_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    summary = SummarizedJournal(user_id=user.id, summary_text="old")
    db.add(summary)
    db.commit()
    db.refresh(summary)

    monkeypatch.setattr(agent_rerun_service, "summarize_journal_entries", Dummy.summarize)

    updated = agent_rerun_service.rerun_summary(db, summary.id)
    assert updated.summary_text == "new summary"
    db.close()


def test_rerun_endpoint(monkeypatch):
    db = setup_db()
    user = create_user(
        db,
        {
            "email": f"rr2_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    summary = SummarizedJournal(user_id=user.id, summary_text="old")
    db.add(summary)
    db.commit()
    db.refresh(summary)

    monkeypatch.setattr(agent_rerun_service, "summarize_journal_entries", Dummy.summarize)

    admin = create_user(
        db,
        {
            "email": f"ad_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
            "role": "admin",
        },
    )
    token = create_access_token({"user_id": admin.id})
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(f"/admin/journal-summaries/{summary.id}/rerun", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["summary_text"] == "new summary"
    db.close()
