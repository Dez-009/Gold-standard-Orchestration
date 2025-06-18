"""Unit tests for the admin notes service."""

import os
import sys
import uuid
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import admin_notes_service, user_service
from models.summarized_journal import SummarizedJournal
from tests.conftest import TestingSessionLocal


def setup_entities():
    db = TestingSessionLocal()
    user = user_service.create_user(
        db,
        {
            "email": f"svc_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": "admin",
        },
    )
    summary = SummarizedJournal(user_id=user.id, summary_text="t", created_at=datetime.utcnow())
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return db, user, summary


def test_add_and_get_notes():
    db, admin, summary = setup_entities()
    n1 = admin_notes_service.add_note(db, summary.id, admin.id, "first")
    n2 = admin_notes_service.add_note(db, summary.id, admin.id, "second")
    notes = admin_notes_service.get_notes_timeline(db, summary.id)
    assert notes[0]["content"] == "second"
    assert notes[1]["content"] == "first"
    assert len(notes) == 2
    db.close()
