"""Service aggregating feedback metrics for admin dashboards."""

from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import func

from models.agent_feedback import AgentFeedback
from models.user_feedback import UserFeedback
from models.agent_feedback_alert import AgentFeedbackAlert
from models.agent_output_flag import AgentOutputFlag


def _week_func(db: Session):
    """Return dialect aware week truncation function."""
    if db.bind.dialect.name == "sqlite":
        return func.strftime('%Y-%W', UserFeedback.submitted_at)
    return func.date_trunc('week', UserFeedback.submitted_at)


def get_feedback_summary(db: Session) -> dict:
    """Compute aggregate feedback stats used by the admin UI."""

    # Notes: Determine total likes and dislikes for the summarization agent
    reaction_rows = (
        db.query(AgentFeedback.emoji_reaction, func.count(AgentFeedback.id))
        .group_by(AgentFeedback.emoji_reaction)
        .all()
    )
    likes = 0
    dislikes = 0
    for reaction, count in reaction_rows:
        if reaction == "👍":
            likes = count
        if reaction == "👎":
            dislikes = count

    # Notes: Average star rating from alert table (1-5 scale)
    avg_rating = db.query(func.avg(AgentFeedbackAlert.rating)).scalar() or 0

    # Notes: Count number of flagged summaries for the summarization agent
    flagged_count = db.query(func.count(AgentOutputFlag.id)).scalar() or 0

    # Notes: Weekly feedback submission counts for trend charts
    week = _week_func(db)
    weekly_rows = (
        db.query(week.label("week"), func.count(UserFeedback.id))
        .group_by("week")
        .order_by("week")
        .all()
    )
    weekly = [{"week": str(w), "count": c} for w, c in weekly_rows]

    return {
        "agents": {
            "JournalSummarizationAgent": {
                "likes": likes,
                "dislikes": dislikes,
                "average_rating": float(avg_rating),
                "flagged": flagged_count,
            }
        },
        "feedback_weekly": weekly,
    }
