"""Service calculating churn prediction scores for all active users."""

# Notes: Import modules for timestamp arithmetic
from datetime import datetime, timedelta
import json

# Notes: SQLAlchemy session for DB operations
from sqlalchemy.orm import Session

# Notes: Required models used to compute scores
from models import (
    ChurnScore,
    User,
    UserSession,
    JournalEntry,
    Goal,
    Subscription,
)


def _score_for_user(db: Session, user: User) -> ChurnScore:
    """Calculate churn score for a single user and persist the row."""

    now = datetime.utcnow()
    window_start = now - timedelta(days=30)

    # Notes: Track explanations for why risk increased
    reasons: list[str] = []

    # Notes: Count login sessions in the last 30 days
    session_count = (
        db.query(UserSession)
        .filter(UserSession.user_id == user.id, UserSession.session_start >= window_start)
        .count()
    )
    if session_count == 0:
        reasons.append("no_recent_logins")

    # Notes: Determine journal entry frequency in the last month
    journal_count = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user.id, JournalEntry.created_at >= window_start)
        .count()
    )
    if journal_count < 2:
        reasons.append("low_journal_activity")

    # Notes: Measure goal completion ratio
    total_goals = db.query(Goal).filter(Goal.user_id == user.id).count()
    completed_goals = db.query(Goal).filter(Goal.user_id == user.id, Goal.is_completed == True).count()
    progress = 0 if total_goals == 0 else completed_goals / total_goals
    if progress < 0.5:
        reasons.append("low_goal_progress")

    # Notes: Determine subscription status by latest record
    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id)
        .order_by(Subscription.created_at.desc())
        .first()
    )
    subscription_active = sub is not None and sub.status in {"active", "trialing"}
    if not subscription_active:
        reasons.append("inactive_subscription")

    # Notes: Calculate risk as fraction of failed checks
    score = len(reasons) / 4

    # Notes: Persist the generated score in the database
    churn = ChurnScore(
        user_id=user.id,
        churn_risk=score,
        calculated_at=now,
        reasons=json.dumps(reasons) if reasons else None,
    )
    db.add(churn)
    db.commit()
    db.refresh(churn)
    return churn


def calculate_churn_scores(db: Session) -> None:
    """Iterate all active users and calculate their churn scores."""

    users = db.query(User).filter(User.is_active == True).all()
    for user in users:
        _score_for_user(db, user)


def list_churn_scores(db: Session, limit: int = 100, offset: int = 0) -> list[ChurnScore]:
    """Return churn scores ordered by most recent calculation."""

    return (
        db.query(ChurnScore)
        .order_by(ChurnScore.calculated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
