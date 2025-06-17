"""Service for computing quality scores for agent responses."""

# Notes: Import typing helpers and uuid type for clarity
from __future__ import annotations
from typing import Sequence, Dict
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session

from models.agent_score import AgentScore


def score_agent_responses(
    user_id: UUID, agent_outputs: Sequence[tuple[str, str]]
) -> dict:
    """Return scoring metrics for each provided agent response."""

    # Notes: Container for per-agent score dictionaries
    scores: Dict[str, dict] = {}

    # Notes: Iterate through all supplied agent outputs
    for agent_name, response_text in agent_outputs:
        # Notes: Simple length-based completeness calculation
        completeness = min(len(response_text) / 200.0, 1.0)

        # Notes: Placeholder values for clarity and relevance
        clarity = 0.5
        relevance = 0.5

        # Notes: Store the metrics in the mapping by agent name
        scores[agent_name] = {
            "completeness_score": completeness,
            "clarity_score": clarity,
            "relevance_score": relevance,
        }

    # Notes: Final result object includes the user_id for reference
    return {"user_id": user_id, "scores": scores}

# Footnote: Future improvements will replace stub scoring with NLP-based checks.


def list_agent_scores(
    db: Session,
    agent_name: str | None = None,
    user_id: int | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[AgentScore]:
    """Return scoring entries filtered by the provided parameters."""

    # Notes: Begin building the query selecting from the AgentScore table
    query = db.query(AgentScore)

    # Notes: Apply optional filters when values are supplied
    if agent_name:
        query = query.filter(AgentScore.agent_name == agent_name)
    if user_id:
        query = query.filter(AgentScore.user_id == user_id)
    if start_date:
        query = query.filter(AgentScore.created_at >= start_date)
    if end_date:
        query = query.filter(AgentScore.created_at <= end_date)

    # Notes: Order by most recent and apply pagination before returning
    return (
        query.order_by(AgentScore.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

