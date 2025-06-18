"""Service computing token usage cost metrics for admins."""

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.orchestration_log import OrchestrationPerformanceLog

# Assumed flat pricing per 1K tokens
COST_PER_THOUSAND_TOKENS = 0.002


def _date_functions(db: Session):
    """Return dialect specific helpers for day and week extraction."""
    dialect = db.bind.dialect.name
    if dialect == "sqlite":
        day = func.strftime('%Y-%m-%d', OrchestrationPerformanceLog.timestamp)
        week = func.strftime('%Y-%W', OrchestrationPerformanceLog.timestamp)
    else:
        day = func.date_trunc('day', OrchestrationPerformanceLog.timestamp)
        week = func.date_trunc('week', OrchestrationPerformanceLog.timestamp)
    return day, week


def aggregate_agent_costs(db: Session) -> dict:
    """Return total token usage grouped by day and week."""
    day_func, week_func = _date_functions(db)
    token_sum = func.sum(
        OrchestrationPerformanceLog.input_tokens + OrchestrationPerformanceLog.output_tokens
    )

    daily_rows = (
        db.query(day_func.label('period'), token_sum)
        .group_by('period')
        .order_by('period')
        .all()
    )
    weekly_rows = (
        db.query(week_func.label('period'), token_sum)
        .group_by('period')
        .order_by('period')
        .all()
    )

    daily = [
        {
            "period": str(p),
            "tokens": t or 0,
            "cost": round((t or 0) / 1000 * COST_PER_THOUSAND_TOKENS, 4),
        }
        for p, t in daily_rows
    ]
    weekly = [
        {
            "period": str(p),
            "tokens": t or 0,
            "cost": round((t or 0) / 1000 * COST_PER_THOUSAND_TOKENS, 4),
        }
        for p, t in weekly_rows
    ]
    total_tokens = sum(d["tokens"] for d in daily)
    total_cost = round(total_tokens / 1000 * COST_PER_THOUSAND_TOKENS, 4)
    return {
        "total_tokens": total_tokens,
        "total_cost": total_cost,
        "daily": daily,
        "weekly": weekly,
    }

# Footnote: Simple aggregation used for admin cost dashboards.
