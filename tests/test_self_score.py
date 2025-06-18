"""Tests for agent self score logging."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from auth.auth_utils import create_access_token
from services.agent_self_score_service import log_self_score, get_scores_by_agent
from services.user_service import create_user
from models.summarized_journal import SummarizedJournal
from tests.conftest import TestingSessionLocal, engine
from database.base import Base

client = TestClient(app)


def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def test_log_and_fetch_self_score():
    db = setup_db()
    user = create_user(
        db,
        {
            "email": f"ss_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    summary = SummarizedJournal(user_id=user.id, summary_text="sum")
    db.add(summary)
    db.commit()
    db.refresh(summary)

    row = log_self_score(db, "JournalSummarizationAgent", summary.id, user.id, 0.9)
    assert row.self_score == 0.9

    results = get_scores_by_agent(db, "JournalSummarizationAgent")
    assert results and results[0].id == row.id
    db.close()

