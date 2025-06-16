"""Service functions for recording and retrieving system metrics."""

# Notes: Typing imports used for function signatures
from typing import Dict

# Notes: SQLAlchemy session and aggregate functions
from sqlalchemy.orm import Session
from sqlalchemy import func

# Notes: Import ORM models referenced in the computations
from models.system_metrics import SystemMetric
from models.user import User
from models.subscription import Subscription


def record_metric(db: Session, metric_name: str, metric_value: float) -> SystemMetric:
    """Insert a metric record into the database."""
    metric = SystemMetric(metric_name=metric_name, metric_value=metric_value)
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric


def get_recent_metrics(db: Session) -> Dict[str, float]:
    """Return the latest metrics for administrative reporting."""
    # Notes: Start with counts computed directly from core tables
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_subscriptions = (
        db.query(func.count(Subscription.id))
        .filter(Subscription.status == "active")
        .scalar()
        or 0
    )

    # Notes: Retrieve the most recent value for each recorded metric name
    sub = (
        db.query(
            SystemMetric.metric_name,
            func.max(SystemMetric.recorded_at).label("max_time"),
        )
        .group_by(SystemMetric.metric_name)
        .subquery()
    )
    rows = (
        db.query(SystemMetric.metric_name, SystemMetric.metric_value)
        .join(
            sub,
            (SystemMetric.metric_name == sub.c.metric_name)
            & (SystemMetric.recorded_at == sub.c.max_time),
        )
        .all()
    )

    metrics = {name: value for name, value in rows}
    metrics.setdefault("total_users", total_users)
    metrics.setdefault("active_subscriptions", active_subscriptions)
    metrics.setdefault("total_revenue", 0.0)
    metrics.setdefault("ai_completions", metrics.get("ai_completions", 0))
    return metrics
