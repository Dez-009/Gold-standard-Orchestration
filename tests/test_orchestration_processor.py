"""Tests for the orchestration processor service."""

import os
import sys
import uuid
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import orchestration_processor_service as orchestrator
from services.user_personality_service import assign_personality
from services.user_service import create_user
from tests.conftest import TestingSessionLocal
import services.agents.career_agent as career_agent
import services.agents.financial_agent as financial_agent


# Verify that responses from all assigned agents are aggregated

def test_process_user_prompt_collects_all(monkeypatch):
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"orch_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )
    assign_personality(db, user.id, uuid.uuid4(), "career")
    assign_personality(db, user.id, uuid.uuid4(), "finance")

    monkeypatch.setattr(career_agent, "process", lambda prompt: "career reply")
    monkeypatch.setattr(financial_agent, "process", lambda prompt: "finance reply")
    monkeypatch.setitem(orchestrator.AGENT_PROCESSORS, "career", career_agent.process)
    monkeypatch.setitem(orchestrator.AGENT_PROCESSORS, "finance", financial_agent.process)

    result = orchestrator.process_user_prompt(db, user.id, "help me")
    assert {"agent": "career", "response": "career reply"} in result
    assert {"agent": "finance", "response": "finance reply"} in result
    db.close()
