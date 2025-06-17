"""Utility functions aggregating user behavior for admin insights."""

from __future__ import annotations

# Notes: Standard library imports for date calculations
from datetime import datetime, timedelta

# Notes: SQLAlchemy helpers used for aggregations
from sqlalchemy.orm import Session
from sqlalchemy import func

# Notes: ORM models representing user activity tables
from models.daily_checkin import DailyCheckIn
from models.goal import Goal
from models.journal_entry import JournalEntry


# Notes: Aggregate recent activity and compute summary metrics
# This function currently returns basic statistics and a mock AI insight.
def generate_behavioral_insights(db: Session) -> dict:
    """Return computed behavioral insights for the admin dashboard."""

    # Notes: Analyze data over the past 30 days
    window_start = datetime.utcnow() - timedelta(days=30)

    # Notes: Count check-ins created within the window
    total_checkins = (
        db.query(func.count(DailyCheckIn.id))
        .filter(DailyCheckIn.created_at >= window_start)
        .scalar()
        or 0
    )

    # Notes: Count completed goals updated within the window
    completed_goals = (
        db.query(func.count(Goal.id))
        .filter(Goal.is_completed.is_(True))
        .filter(Goal.updated_at >= window_start)
        .scalar()
        or 0
    )

    # Notes: Count journal entries written within the window
    journal_entries = (
        db.query(func.count(JournalEntry.id))
        .filter(JournalEntry.created_at >= window_start)
        .scalar()
        or 0
    )

    # Notes: Calculate the average number of check-ins per week
    avg_checkins_per_week = total_checkins / 4.0

    # Notes: Determine the top five users by check-in count
    rows = (
        db.query(DailyCheckIn.user_id, func.count(DailyCheckIn.id).label("c"))
        .filter(DailyCheckIn.created_at >= window_start)
        .group_by(DailyCheckIn.user_id)
        .order_by(func.count(DailyCheckIn.id).desc())
        .limit(5)
        .all()
    )
    top_users = [{"user_id": uid, "checkins": cnt} for uid, cnt in rows]

    # Notes: Placeholder for future AI-powered narrative analysis
    ai_summary = (
        "Users are engaging consistently. AI-generated insights will appear here."
    )

    # Notes: Return a dictionary summarizing the computed metrics
    return {
        "avg_checkins_per_week": avg_checkins_per_week,
        "journal_entries": journal_entries,
        "completed_goals": completed_goals,
        "top_active_users": top_users,
        "ai_summary": ai_summary,
    }
