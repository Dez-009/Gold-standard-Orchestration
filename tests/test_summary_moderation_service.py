"""Unit tests for summary moderation flagging."""

import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import summary_moderation_service, user_service
from models.journal_summary import JournalSummary
from models.summarized_journal import SummarizedJournal
from models.agent_output_flag import AgentOutputFlag
from tests.conftest import TestingSessionLocal


def create_user(db: TestingSessionLocal) -> int:
    user = user_service.create_user(
        db,
        {
            "email": f"mod_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pw",
        },
    )
    return user.id


def test_flag_summary_when_moderation_fails():
    """Summary containing banned words should be flagged."""
    db = TestingSessionLocal()
    user_id = create_user(db)
    summary = JournalSummary(user_id=user_id, summary_text="forbidden text", source_entry_ids="[]")
    db.add(summary)
    db.commit()
    db.refresh(summary)

    summary_moderation_service.flag_summary_if_needed(db, summary, user_id)
    flags = db.query(AgentOutputFlag).all()
    summary_id = summary.id
    db.refresh(summary)
    db.close()
    assert any(f.summary_id == summary_id for f in flags)
    assert summary.flagged is True
    assert summary.flag_reason == "moderation_violation"


def test_auto_flag_summary():
    """Keyword triggers should auto flag the summary and log an event."""
    db = TestingSessionLocal()
    user_id = create_user(db)
    summary = SummarizedJournal(user_id=user_id, summary_text="I want to kill")
    db.add(summary)
    db.commit()
    db.refresh(summary)

    flagged, trigger = summary_moderation_service.auto_flag_summary(db, summary.id, summary.summary_text)
    db.refresh(summary)
    assert flagged is True
    assert trigger == "keyword"
    assert summary.flagged is True
    assert summary.flag_reason.startswith("Auto-flagged")

