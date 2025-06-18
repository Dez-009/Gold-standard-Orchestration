import os
import sys
from uuid import uuid4

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.summarized_journal_service import flag_summary, unflag_summary
from models.summarized_journal import SummarizedJournal
from tests.conftest import TestingSessionLocal, engine
from database.base import Base


def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def test_flag_unflag_summary():
    db = setup_db()
    record = SummarizedJournal(user_id=1, summary_text="hello")
    db.add(record)
    db.commit()
    db.refresh(record)

    flag_summary(db, record.id, "manual")
    db.expire_all()
    row = db.query(SummarizedJournal).get(record.id)
    assert row.flagged is True
    assert row.flag_reason == "manual"
    assert row.flagged_at is not None

    unflag_summary(db, record.id)
    db.expire_all()
    row = db.query(SummarizedJournal).get(record.id)
    assert row.flagged is False
    assert row.flag_reason is None
    assert row.flagged_at is None
    db.close()
