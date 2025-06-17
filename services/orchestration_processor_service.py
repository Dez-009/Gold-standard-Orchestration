"""Service orchestrating multi-agent execution for a user prompt."""

from __future__ import annotations

# Notes: SQLAlchemy session type for database access
from sqlalchemy.orm import Session

# Notes: ORM model storing personality assignments per user
from models.user_personality import UserPersonality

# Notes: Import individual agent processors
from services.agents import (
    career_agent,
    wellness_agent,
    relationship_agent,
    financial_agent,
    mindset_agent,
)

# Notes: Service used to record execution details
from services.agent_execution_log_service import log_agent_execution
# Notes: Utility to check if an agent is currently active
# Notes: Import utilities for loading and checking agent state context
from services.agent_context_loader import load_agent_context, is_agent_active

# Notes: Timing utility for measuring execution latency
import time

# Notes: Map domain names to their processor functions
AGENT_PROCESSORS = {
    "career": career_agent.process,
    "health": wellness_agent.process,
    "relationships": relationship_agent.process,
    "finance": financial_agent.process,
    "mental_health": mindset_agent.process,
}


# Notes: Process the user prompt with all assigned agents

def process_user_prompt(db: Session, user_id: int, user_prompt: str) -> list[dict]:
    """Return responses from each agent assigned to the user."""

    # Notes: Retrieve all personality assignments for the user
    assignments = (
        db.query(UserPersonality)
        .filter(UserPersonality.user_id == user_id)
        .all()
    )

    # Notes: Determine which agents are active for the user one time up front
    active_agents = load_agent_context(db, user_id)

    responses: list[dict] = []

    # Notes: Execute each agent processor and log execution details
    for assignment in assignments:
        # Notes: When a list of active agents was returned, skip agents not in it
        if active_agents and assignment.domain not in active_agents:
            continue

        # Notes: When no list was returned, fall back to individual state check
        if not active_agents and not is_agent_active(db, user_id, assignment.domain):
            continue

        processor = AGENT_PROCESSORS.get(assignment.domain)
        if processor is None:
            # Notes: Skip domains without a matching processor
            continue
        start = time.perf_counter()
        try:
            result_text = processor(user_prompt)
            success = True
            error_message = None
        except Exception as exc:  # pragma: no cover - generic failure capture
            result_text = ""
            success = False
            error_message = str(exc)
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        # Notes: Persist execution metrics regardless of success
        log_agent_execution(
            db,
            user_id,
            assignment.domain,
            user_prompt,
            result_text,
            success,
            elapsed_ms,
            error_message,
        )
        if success:
            responses.append({"agent": assignment.domain, "response": result_text})

    # Notes: Aggregated list of agent responses is returned to the caller
    return responses
# Footnote: Coordinates calling each domain agent and filters them using
# Notes: `load_agent_context` so only active agents generate responses.
