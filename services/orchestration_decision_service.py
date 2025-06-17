"""Decision logic for selecting which agents should handle a prompt."""

from __future__ import annotations

# Notes: Import the SQLAlchemy session type for database operations
from sqlalchemy.orm import Session

# Notes: ORM models representing user journals and goals
from models.journal_entry import JournalEntry
from models.goal import Goal


# Notes: Analyze the user's context and prompt to choose appropriate agents

def determine_agent_flow(db: Session, user_id: int, user_prompt: str) -> list[str]:
    """Return a prioritized list of agent names for the orchestration layer."""

    # Notes: Load basic counts of journals and goals to demonstrate contextual lookups
    journal_count = (
        db.query(JournalEntry).filter(JournalEntry.user_id == user_id).count()
    )
    goal_count = db.query(Goal).filter(Goal.user_id == user_id).count()
    _ = journal_count, goal_count  # placeholder for future heuristic use

    # Notes: Normalize the prompt for simpler keyword checks
    text = user_prompt.lower()

    agents: list[str] = []

    # Notes: Rule 1 - career oriented questions trigger the career agent
    if "career" in text:
        agents.append("career")

    # Notes: Rule 2 - financial queries route to the finance agent
    if "finance" in text:
        agents.append("finance")

    # Notes: Rule 3 - health or wellness topics use the health agent
    if "health" in text:
        agents.append("health")

    # Notes: Fallback - when no domain keywords are present, use the general coach
    if not agents:
        agents.append("general_coach")

    # Notes: The ordered list dictates which agents the processor should invoke
    return agents

# Footnote: Centralizes orchestration agent selection logic for multi-domain coaching.
