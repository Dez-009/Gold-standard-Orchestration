import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from database.base import Base
from database.session import engine
from models.summarized_journal import SummarizedJournal
from services import summarized_journal_service, user_service
from tests.conftest import TestingSessionLocal


def setup_user(db: TestingSessionLocal) -> int:
    user = user_service.create_user(
        db,
        {
            "email": f"flag_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pw",
        },
    )
    return user.id


def create_summary(db: TestingSessionLocal, user_id: int) -> SummarizedJournal:
    summary = SummarizedJournal(user_id=user_id, summary_text="test")
    db.add(summary)
    db.commit()
    db.refresh(summary)
    return summary


def test_flag_unflag_summary():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    user_id = setup_user(db)
    summary = create_summary(db, user_id)

    flagged = summarized_journal_service.flag_summary(db, summary.id, "bad")
    assert flagged is not None
    assert flagged.flagged
    assert flagged.flag_reason == "bad"

    updated = summarized_journal_service.unflag_summary(db, summary.id)
    assert updated is not None
    assert not updated.flagged
    assert updated.flag_reason is None
    db.close()
