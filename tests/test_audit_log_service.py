import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from main import app
from database.session import engine
from database.base import Base
from tests.conftest import TestingSessionLocal
from models.summarized_journal import SummarizedJournal
from services import audit_log_service, user_service

client = TestClient(app)


def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


def test_get_summary_audit_trail():
    db = setup_db()
    user = user_service.create_user(
        db,
        {
            "email": f"sa_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    summary = SummarizedJournal(user_id=user.id, summary_text="text")
    db.add(summary)
    db.commit()
    db.refresh(summary)

    for evt in ["edit", "annotate"]:
        audit_log_service.log_event(
            db,
            summary.id,
            evt,
            {"user_id": user.id, "admin_id": 1, "agent_name": "JournalSummarizationAgent"},
        )

    logs = audit_log_service.get_summary_audit_trail(db, summary.id)
    assert len(logs) == 2
    assert set(l.event_type for l in logs) == {"edit", "annotate"}
    db.close()
