"""Test the summary diff generation service."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

import services.summary_diff_service as diff_service
from services.user_service import create_user
from models.summarized_journal import SummarizedJournal
from models.journal_entry import JournalEntry
from tests.conftest import TestingSessionLocal, engine
from database.base import Base


def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def test_generate_summary_diff():
    db = setup_db()
    original = diff_service.SessionLocal
    diff_service.SessionLocal = TestingSessionLocal
    user = create_user(
        db,
        {
            "email": f"sd_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    entry = JournalEntry(user_id=user.id, content="today I walked")
    db.add(entry)
    db.commit()
    db.refresh(entry)

    first = SummarizedJournal(
        user_id=user.id,
        summary_text="I walked today",
        source_entry_ids=f"[{entry.id}]",
    )
    db.add(first)
    db.commit()
    db.refresh(first)

    second = SummarizedJournal(
        user_id=user.id,
        summary_text="I walked quickly today",
        source_entry_ids=f"[{entry.id}]",
    )
    db.add(second)
    db.commit()
    db.refresh(second)

    diff = diff_service.generate_summary_diff(second.id)
    diff_service.SessionLocal = original
    db.close()
    assert "table" in diff
    assert "quickly" in diff

