"""Service functions for persisting and reading agent self scores."""

# Notes: typing imports for clarity
from __future__ import annotations
from uuid import UUID
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from utils.logger import get_logger
from models.agent_self_score import AgentSelfScore

logger = get_logger()


def log_self_score(
    db: Session,
    agent_name: str,
    summary_id: UUID,
    user_id: int,
    score: float,
    reasoning: str | None = None,
) -> AgentSelfScore:
    """Persist a single self scoring entry."""

    # Notes: Create the ORM record instance with provided values
    entry = AgentSelfScore(
        agent_name=agent_name,
        summary_id=summary_id,
        user_id=user_id,
        self_score=score,
        reasoning=reasoning,
    )

    # Notes: Attempt to commit up to 3 times logging each failure
    attempts = 0
    while attempts < 3:
        try:
            db.add(entry)
            db.commit()
            db.refresh(entry)
            break
        except SQLAlchemyError as exc:
            db.rollback()
            attempts += 1
            logger.warning("Persist self score attempt %s failed: %s", attempts, exc)
    return entry


def get_scores_by_agent(db: Session, agent_name: str, limit: int = 100) -> list[AgentSelfScore]:
    """Return the most recent self scores for the specified agent."""

    return (
        db.query(AgentSelfScore)
        .filter(AgentSelfScore.agent_name == agent_name)
        .order_by(AgentSelfScore.created_at.desc())
        .limit(limit)
        .all()
    )

# Footnote: Enables monitoring of agent confidence over time.

