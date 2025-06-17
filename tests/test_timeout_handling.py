import os
import sys
import uuid
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

os.environ.setdefault("OPENAI_API_KEY", "test")
from services import orchestration_processor_service as orchestrator
from services.user_service import create_user
from tests.conftest import TestingSessionLocal


def test_run_parallel_agents_timeout(monkeypatch):
    db = TestingSessionLocal()
    user = create_user(
        db,
        {
            "email": f"timeout_{uuid.uuid4().hex}@example.com",
            "phone_number": str(int(uuid.uuid4().int % 10_000_000_000)).zfill(10),
            "hashed_password": "pwd",
        },
    )

    monkeypatch.setattr(orchestrator, "build_memory_context", lambda *_: "mem")
    monkeypatch.setattr(
        orchestrator,
        "build_agent_prompt",
        lambda a, *_: [{"role": "user", "content": a}],
    )
    import services.llm_call_service as llm_service

    def slow_call(_payload):
        time.sleep(0.05)
        return "late"

    monkeypatch.setattr(llm_service, "call_llm", slow_call)

    result = orchestrator.run_parallel_agents(
        user.id,
        "prompt",
        ["career"],
        db,
        timeout_seconds=0.01,
    )
    assert result["career"]["status"] == "timeout"
    assert "too long" in result["career"]["content"]
    db.close()
