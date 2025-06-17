"""Service providing aggregated analytics data for admin dashboards."""

# Notes: SQLAlchemy helpers for database queries
from sqlalchemy.orm import Session
from sqlalchemy import func

# Notes: Import the analytics event ORM model
from models.analytics_event import AnalyticsEvent


def _date_functions(db: Session):
    """Return dialect-specific functions for date truncation."""

    dialect = db.bind.dialect.name
    if dialect == "sqlite":
        day = func.strftime('%Y-%m-%d', AnalyticsEvent.timestamp)
        week = func.strftime('%Y-%W', AnalyticsEvent.timestamp)
    else:
        day = func.date_trunc('day', AnalyticsEvent.timestamp)
        week = func.date_trunc('week', AnalyticsEvent.timestamp)
    return day, week


def get_analytics_summary(db: Session) -> dict:
    """Return counts of analytics events grouped by type and time."""

    # Notes: Compute total count of analytics events
    total = db.query(func.count(AnalyticsEvent.id)).scalar() or 0

    # Notes: Aggregate counts for each event type
    by_type_rows = (
        db.query(AnalyticsEvent.event_type, func.count(AnalyticsEvent.id))
        .group_by(AnalyticsEvent.event_type)
        .all()
    )
    events_by_type = {t: c for t, c in by_type_rows}

    # Notes: Dialect-specific helpers to group by day and week
    day_func, week_func = _date_functions(db)

    # Notes: Count events per day
    daily_rows = (
        db.query(day_func.label('period'), func.count(AnalyticsEvent.id))
        .group_by('period')
        .order_by('period')
        .all()
    )
    events_daily = [
        {"period": str(day), "count": count} for day, count in daily_rows
    ]

    # Notes: Count events per week
    weekly_rows = (
        db.query(week_func.label('period'), func.count(AnalyticsEvent.id))
        .group_by('period')
        .order_by('period')
        .all()
    )
    events_weekly = [
        {"period": str(week), "count": count} for week, count in weekly_rows
    ]

    return {
        "total_events": total,
        "events_by_type": events_by_type,
        "events_daily": events_daily,
        "events_weekly": events_weekly,
    }
