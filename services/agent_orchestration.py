"""Helper running an agent with a global timeout."""

from __future__ import annotations

# Notes: asyncio provides the timeout utility
import asyncio
from typing import Awaitable, Callable

from sqlalchemy.orm import Session

# Notes: Load timeout setting from configuration
from config import get_settings
from services.agent_timeout_log import log_timeout
from utils.logger import get_logger

settings = get_settings()
logger = get_logger()


async def run_with_timeout(
    db: Session,
    user_id: int,
    agent_name: str,
    agent_call: Callable[[], Awaitable[str]],
) -> dict:
    """Execute ``agent_call`` enforcing the configured timeout."""

    try:
        # Notes: Cancel the task if it exceeds ``AGENT_TIMEOUT_SECONDS``
        result = await asyncio.wait_for(agent_call(), settings.AGENT_TIMEOUT_SECONDS)
        return {"response": result}
    except asyncio.TimeoutError:
        # Notes: Persist the timeout so operations can investigate later
        log_timeout(db, user_id, agent_name)
        logger.warning("Agent %s timed out for user %s", agent_name, user_id)
        return {"error": "timeout"}

# Footnote: Higher level services can build retry loops around this helper.


def retry_agent_run(db: Session, summary_id: str, agent_name: str) -> str:
    """Admin-triggered agent rerun for override or correction."""
    # Notes: Import locally to avoid circular dependencies at module load time
    from uuid import UUID
    import json
    import time
    from models.summarized_journal import SummarizedJournal
    from models.journal_entry import JournalEntry
    from services.agent_execution_log_service import log_agent_execution
    from services.orchestrator import run_agent

    # Notes: Look up the summary record and validate it exists
    sid = UUID(str(summary_id))
    summary = db.query(SummarizedJournal).get(sid)
    if summary is None:
        raise ValueError("Summary not found")

    # Notes: Rehydrate the journal text used for the original summary
    entry_ids = []
    if summary.source_entry_ids:
        try:
            entry_ids = json.loads(summary.source_entry_ids)
        except Exception:
            entry_ids = []
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.id.in_(entry_ids))
        .order_by(JournalEntry.created_at)
        .all()
    )
    journal_text = "\n".join(e.content for e in entries)

    # Notes: Execute the requested agent using the orchestrator helper
    start = time.perf_counter()
    result_text = asyncio.run(run_agent(db, summary.user_id, agent_name, journal_text))
    elapsed_ms = int((time.perf_counter() - start) * 1000)

    # Notes: Persist the new output to the execution log with timing metadata
    log_agent_execution(
        db,
        summary.user_id,
        agent_name,
        journal_text,
        result_text,
        True,
        elapsed_ms,
    )

    return result_text


# Footnote: Used by admin endpoint to manually rerun an agent.
