"""Service aggregating per-agent usage stats for a specific user."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.orchestration_log import OrchestrationPerformanceLog

# Notes: Estimated pricing per 1K tokens for the default model
MODEL_TOKEN_PRICE_USD = 0.002


def get_user_agent_usage_summary(db: Session, user_id: UUID) -> list[dict]:
    """Return aggregated usage metrics grouped by agent name."""

    # Notes: Query aggregated token counts and run totals
    rows = (
        db.query(
            OrchestrationPerformanceLog.agent_name.label("agent"),
            func.count(OrchestrationPerformanceLog.id).label("runs"),
            func.sum(OrchestrationPerformanceLog.input_tokens).label("in_tok"),
            func.sum(OrchestrationPerformanceLog.output_tokens).label("out_tok"),
            func.max(OrchestrationPerformanceLog.timestamp).label("last"),
        )
        .filter(OrchestrationPerformanceLog.user_id == user_id)
        .group_by(OrchestrationPerformanceLog.agent_name)
        .all()
    )

    summary: list[dict] = []
    for agent, runs, in_tok, out_tok, last in rows:
        input_tokens = int(in_tok or 0)
        output_tokens = int(out_tok or 0)
        total_tokens = input_tokens + output_tokens
        cost = round(total_tokens / 1000 * MODEL_TOKEN_PRICE_USD, 4)
        summary.append(
            {
                "agent_name": agent,
                "runs": runs,
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost_usd": cost,
                "last_run": last.isoformat() if isinstance(last, datetime) else None,
            }
        )

    # Notes: Order by agent name for stable output
    return sorted(summary, key=lambda x: x["agent_name"])

# Footnote: Utilized by admin API for per-user usage insights.
