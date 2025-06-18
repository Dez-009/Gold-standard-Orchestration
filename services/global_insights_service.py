"""Service aggregating global usage insights for admin dashboard."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.journal_entry import JournalEntry
from models.agent_execution_log import AgentExecutionLog
from models.user_feedback import UserFeedback, FeedbackType
from models.daily_checkin import DailyCheckIn, Mood


# Notes: Map mood enum values to numeric scores for averaging
_MOOD_SCORES = {
    Mood.EXCELLENT: 5,
    Mood.GOOD: 4,
    Mood.OKAY: 3,
    Mood.STRUGGLING: 2,
    Mood.BAD: 1,
}


def get_global_insights(db: Session) -> Dict[str, int | float | str | None]:
    """Return high level usage metrics for admin dashboard."""

    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    month_start = now - timedelta(days=30)

    # Notes: Count journals created in the last 7 and 30 days
    journals_last_7d = (
        db.query(func.count(JournalEntry.id))
        .filter(JournalEntry.created_at >= week_start)
        .scalar()
        or 0
    )
    journals_last_30d = (
        db.query(func.count(JournalEntry.id))
        .filter(JournalEntry.created_at >= month_start)
        .scalar()
        or 0
    )

    # Notes: Number of distinct users writing journals in the last week
    active_users = (
        db.query(func.count(func.distinct(JournalEntry.user_id)))
        .filter(JournalEntry.created_at >= week_start)
        .scalar()
        or 0
    )

    # Notes: Determine the most frequently executed agent by volume
    agent_row = (
        db.query(AgentExecutionLog.agent_name, func.count(AgentExecutionLog.id))
        .group_by(AgentExecutionLog.agent_name)
        .order_by(func.count(AgentExecutionLog.id).desc())
        .first()
    )
    top_agent = agent_row[0] if agent_row else None

    # Notes: Determine the most common user feedback type
    feedback_row = (
        db.query(UserFeedback.feedback_type, func.count(UserFeedback.id))
        .group_by(UserFeedback.feedback_type)
        .order_by(func.count(UserFeedback.id).desc())
        .first()
    )
    top_feedback_reason = feedback_row[0].value if feedback_row else None

    # Notes: Calculate average mood score using recent check-ins
    moods: List[Mood] = (
        db.query(DailyCheckIn.mood)
        .filter(DailyCheckIn.created_at >= month_start)
        .all()
    )
    if moods:
        mood_values = [_MOOD_SCORES[m[0]] for m in moods]
        avg_mood = sum(mood_values) / len(mood_values)
    else:
        avg_mood = 0.0

    return {
        "journals_last_7d": journals_last_7d,
        "journals_last_30d": journals_last_30d,
        "weekly_active_users": active_users,
        "top_agent": top_agent,
        "top_feedback_reason": top_feedback_reason,
        "avg_mood": round(avg_mood, 2),
    }
