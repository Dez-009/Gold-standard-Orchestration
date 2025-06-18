"""Tests for orchestration replay service and endpoint."""

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
from services import orchestration_replay_service
from models.orchestration_log import OrchestrationPerformanceLog
from tests.conftest import TestingSessionLocal, engine
from database.base import Base

client = TestClient(app)


def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return TestingSessionLocal()


class Dummy:
    @staticmethod
    def summarize(user_id: int, db):
        return "new summary"

    @staticmethod
    def reflect(text: str, mood=None, goals=None, db=None, user_id=None):
        return "reflection"


def test_replay_service(monkeypatch):
    db = setup_db()
    user = create_user(
        db,
        {
            "email": f"rep_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    log = OrchestrationPerformanceLog(agent_name="JournalSummarizationAgent", user_id=user.id)
    db.add(log)
    db.commit()
    db.refresh(log)

    monkeypatch.setattr(orchestration_replay_service, "summarize_journal_entries", Dummy.summarize)
    monkeypatch.setattr(orchestration_replay_service, "generate_reflection_prompt", Dummy.reflect)

    result = orchestration_replay_service.replay_orchestration(db, log.id)
    assert result["outputs"]["summary"] == "new summary"
    assert result["outputs"]["reflection"] == "reflection"
    db.close()


def test_replay_endpoint(monkeypatch):
    db = setup_db()
    user = create_user(
        db,
        {
            "email": f"rep2_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )
    log = OrchestrationPerformanceLog(agent_name="JournalSummarizationAgent", user_id=user.id)
    db.add(log)
    db.commit()
    db.refresh(log)

    monkeypatch.setattr(orchestration_replay_service, "summarize_journal_entries", Dummy.summarize)
    monkeypatch.setattr(orchestration_replay_service, "generate_reflection_prompt", Dummy.reflect)

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
        f"/admin/orchestration-replay/{log.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.json()["outputs"]["summary"] == "new summary"
    db.close()
