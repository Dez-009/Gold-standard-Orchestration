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

    responses: list[dict] = []

    # Notes: Execute each agent processor and collect outputs
    for assignment in assignments:
        processor = AGENT_PROCESSORS.get(assignment.domain)
        if processor is None:
            # Notes: Skip domains without a matching processor
            continue
        result_text = processor(user_prompt)
        responses.append({"agent": assignment.domain, "response": result_text})

    # Notes: Aggregated list of agent responses is returned to the caller
    return responses
