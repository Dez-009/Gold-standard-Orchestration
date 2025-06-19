"""Service computing token usage cost metrics for admins."""

from sqlalchemy.orm import Session
from sqlalchemy import func

from config.settings import get_settings

from models.orchestration_log import OrchestrationPerformanceLog


def get_cost_estimate(tokens: int, model: str = "default") -> float:
    """Return estimated cost for ``tokens`` using configured pricing."""
    pricing = get_settings().model_pricing or {"default": 0.002}
    rate = pricing.get(model, pricing.get("default", 0.002))
    return round(tokens / 1000 * rate, 4)


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
            "cost": get_cost_estimate(t or 0),
        }
        for p, t in daily_rows
    ]
    weekly = [
        {
            "period": str(p),
            "tokens": t or 0,
            "cost": get_cost_estimate(t or 0),
        }
        for p, t in weekly_rows
    ]
    total_tokens = sum(d["tokens"] for d in daily)
    total_cost = get_cost_estimate(total_tokens)
    return {
        "total_tokens": total_tokens,
        "total_cost": total_cost,
        "daily": daily,
        "weekly": weekly,
    }

# Footnote: Simple aggregation used for admin cost dashboards.
