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
from models.summarized_journal import SummarizedJournal
from models.journal_entry import JournalEntry
from models.agent_execution_log import AgentExecutionLog
from services import agent_orchestration
from tests.conftest import TestingSessionLocal, engine
from database.base import Base

client = TestClient(app)


def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


class Dummy:
    @staticmethod
    async def run(db, user_id, agent_name, prompt):
        return "new output"


def test_retry_service_creates_log(monkeypatch):
    db = setup_db()
    user = create_user(
        db,
        {
            "email": f"ra_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    entry = JournalEntry(user_id=user.id, content="hi")
    db.add(entry)
    db.commit()
    db.refresh(entry)
    summary = SummarizedJournal(
        user_id=user.id,
        summary_text="sum",
        source_entry_ids=str([entry.id]),
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    monkeypatch.setattr("services.orchestrator.run_agent", Dummy.run, raising=False)

    text = agent_orchestration.retry_agent_run(db, str(summary.id), "JournalSummarizationAgent")
    assert text == "new output"
    logs = db.query(AgentExecutionLog).all()
    assert len(logs) == 1
    db.close()


def test_retry_endpoint(monkeypatch):
    db = setup_db()
    user = create_user(
        db,
        {
            "email": f"ra2_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    entry = JournalEntry(user_id=user.id, content="hello")
    db.add(entry)
    db.commit()
    db.refresh(entry)
    summary = SummarizedJournal(
        user_id=user.id,
        summary_text="sum",
        source_entry_ids=str([entry.id]),
    )
    db.add(summary)
    db.commit()
    db.refresh(summary)

    monkeypatch.setattr("services.orchestrator.run_agent", Dummy.run, raising=False)

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

    resp = client.post(
        "/admin/agents/retry",
        json={"summary_id": str(summary.id), "agent_name": "JournalSummarizationAgent"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["output"] == "new output"
    db.close()
