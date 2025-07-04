"""Service to replay orchestration runs using updated agent logic."""

from __future__ import annotations

from uuid import UUID
import time

from sqlalchemy.orm import Session

from models.orchestration_log import OrchestrationPerformanceLog
from services.orchestration_summarizer import summarize_journal_entries
from agents.reflection_booster_agent import generate_reflection_prompt


def replay_orchestration(db: Session, log_id: UUID) -> dict:
    """Replay a prior orchestration run and return fresh outputs."""

    # Notes: use SQLAlchemy 2.0 session.get instead of deprecated Query.get
    log = db.get(OrchestrationPerformanceLog, log_id)
    if log is None:
        raise ValueError("Log not found")

    user_id = log.user_id
    start = time.perf_counter()

    # Notes: Attempt summarization twice to handle transient failures
    summary_text = ""
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            summary_text = summarize_journal_entries(user_id, db)
            break
        except Exception as exc:  # pragma: no cover - best effort retry
            last_error = exc
            if attempt == 1:
                summary_text = ""
            else:
                continue

    # Notes: Generate a reflection prompt from the new summary
    reflection = generate_reflection_prompt(
        summary_text, mood=None, goals=None, db=db, user_id=user_id
    )

    elapsed_ms = int((time.perf_counter() - start) * 1000)

    return {
        "user_id": user_id,
        "agent": log.agent_name,
        "outputs": {"summary": summary_text, "reflection": reflection},
        "meta": {"runtime_ms": elapsed_ms, "error": str(last_error) if last_error else None},
    }

# Footnote: Helps admins verify new prompt changes against historical runs.
