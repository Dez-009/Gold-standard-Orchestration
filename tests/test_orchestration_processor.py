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

    # Notes: Decision service recommends both agents based on the prompt
    monkeypatch.setattr(
        orchestrator,
        "determine_agent_flow",
        lambda db, uid, prompt: ["career", "finance"],
    )

    # Notes: Simulate all agents active by returning every assigned agent
    monkeypatch.setattr(orchestrator, "load_agent_context", lambda db, uid: ["career", "finance"])

    result = orchestrator.process_user_prompt(db, user.id, "help me")
    assert {"agent": "career", "response": "career reply"} in result
    assert {"agent": "finance", "response": "finance reply"} in result
    db.close()


# Verify that only active agents return responses when subset active

def test_process_user_prompt_subset_active(monkeypatch):
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

    # Notes: Decision service recommends both agents but only career is active
    monkeypatch.setattr(
        orchestrator,
        "determine_agent_flow",
        lambda db, uid, prompt: ["career", "finance"],
    )

    # Notes: Only the career agent is marked active
    monkeypatch.setattr(orchestrator, "load_agent_context", lambda db, uid: ["career"])

    result = orchestrator.process_user_prompt(db, user.id, "help me")
    assert {"agent": "career", "response": "career reply"} in result
    assert all(res["agent"] != "finance" for res in result)
    db.close()


# Verify handling when no agents are active for the user

def test_process_user_prompt_no_active(monkeypatch):
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

    # Notes: Empty active list combined with inactive checks disables all agents
    monkeypatch.setattr(orchestrator, "load_agent_context", lambda db, uid: [])
    monkeypatch.setattr(orchestrator, "is_agent_active", lambda db, uid, name: False)
    monkeypatch.setattr(
        orchestrator,
        "determine_agent_flow",
        lambda db, uid, prompt: ["career", "finance"],
    )

    result = orchestrator.process_user_prompt(db, user.id, "help me")
    assert result == []
    db.close()

# Footnote: Ensures orchestration respects active agent context.


# Verify that the parallel runner aggregates responses for multiple agents

def test_run_parallel_agents(monkeypatch):
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"orch_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
        },
    )

    # Notes: Fake memory and prompt assembly to isolate asyncio logic
    monkeypatch.setattr(orchestrator, "build_memory_context", lambda *_: "mem")
    monkeypatch.setattr(
        orchestrator,
        "build_agent_prompt",
        lambda a, *_: [{"role": "user", "content": f"{a}"}],
    )

    # Notes: Stub the LLM call so no external request occurs
    import services.llm_call_service as llm_service

    def fake_call_llm(payload):
        return payload[-1]["content"] + " reply"

    monkeypatch.setattr(llm_service, "call_llm", fake_call_llm)

    result = orchestrator.run_parallel_agents(
        user.id,
        "help me",
        ["career", "finance"],
        db,
    )

    assert result == {"career": "career reply", "finance": "finance reply"}
    db.close()

# Verify role-based access control prevents unauthorized agent execution

def test_orchestrator_blocks_disallowed_agent(monkeypatch):
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"orch_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": "user",
        },
    )
    assign_personality(db, user.id, uuid.uuid4(), "career")

    monkeypatch.setattr(orchestrator, "determine_agent_flow", lambda *_: ["career"])
    monkeypatch.setattr(orchestrator, "load_agent_context", lambda *_: ["career"])
    monkeypatch.setattr(orchestrator, "build_personalized_prompt", lambda *a: "p")
    monkeypatch.setattr(orchestrator, "build_agent_prompt", lambda *a: [])
    monkeypatch.setitem(orchestrator.AGENT_PROCESSORS, "career", lambda _m: "r")

    from services import agent_access_control
    monkeypatch.setitem(agent_access_control.AGENT_ROLE_REQUIREMENTS, "career", ["admin"])

    result = orchestrator.process_user_prompt(db, user.id, "test")
    assert result == []
    db.close()


# Verify parallel runner also skips disallowed agents

def test_parallel_agents_respects_role(monkeypatch):
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"orch_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "password123",
            "role": "user",
        },
    )

    monkeypatch.setattr(orchestrator, "build_memory_context", lambda *_: "mem")
    monkeypatch.setattr(orchestrator, "build_agent_prompt", lambda a, *_: [{"role": "user", "content": a}])
    import services.llm_call_service as llm_service
    monkeypatch.setattr(llm_service, "call_llm", lambda *_: "reply")

    from services import agent_access_control
    monkeypatch.setitem(agent_access_control.AGENT_ROLE_REQUIREMENTS, "career", ["admin"])

    result = orchestrator.run_parallel_agents(
        user.id,
        "prompt",
        ["career", "finance"],
        db,
    )
    assert "career" not in result
    assert "finance" in result
    db.close()
