"""Service helpers for agent feedback alerts."""

from uuid import UUID
from sqlalchemy.orm import Session

from models.agent_feedback_alert import AgentFeedbackAlert
from utils.logger import get_logger

logger = get_logger()


def log_alert_if_low_rating(
    db: Session,
    user_id: int,
    summary_id: str | UUID,
    rating: int,
) -> AgentFeedbackAlert | None:
    """Create an alert when the rating is at or below two stars."""
    # Notes: Convert the summary_id to a UUID object for querying
    sid = UUID(str(summary_id))
    # Notes: Only persist an alert when the rating is considered low
    if rating <= 2:
        alert = AgentFeedbackAlert(
            user_id=user_id,
            summary_id=sid,
            rating=rating,
            flagged_reason="rating_below_threshold",
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        # Notes: Log the creation for audit visibility
        logger.info(
            "feedback_alert_created",
            extra={"user": user_id, "summary": str(summary_id), "rating": rating},
        )
        return alert
    return None


def get_recent_alerts(db: Session, limit: int = 10) -> list[AgentFeedbackAlert]:
    """Return the newest alert records."""
    # Notes: Query alerts ordered by most recent first with configurable limit
    return (
        db.query(AgentFeedbackAlert)
        .order_by(AgentFeedbackAlert.created_at.desc())
        .limit(limit)
        .all()
    )

# Footnote: Additional filtering may be added when escalation tiers exist.
