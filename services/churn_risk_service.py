"""Service for calculating and retrieving churn risk scores."""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from models import (
    ChurnRisk,
    RiskCategory,
    UserSession,
    JournalEntry,
    AgentInteractionLog,
    Subscription,
    User,
)


def calculate_churn_risk(db: Session, user_id: int) -> ChurnRisk:
    """Compute the churn risk for a single user and persist the record."""

    now = datetime.utcnow()
    window_start = now - timedelta(days=30)

    # Notes: Count recent login sessions
    session_count = (
        db.query(UserSession)
        .filter(UserSession.user_id == user_id, UserSession.session_start >= window_start)
        .count()
    )

    # Notes: Count recent journal entries
    journal_count = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id, JournalEntry.created_at >= window_start)
        .count()
    )

    # Notes: Count recent AI interactions
    interaction_count = (
        db.query(AgentInteractionLog)
        .filter(AgentInteractionLog.user_id == user_id, AgentInteractionLog.timestamp >= window_start)
        .count()
    )

    # Notes: Determine if the latest subscription record is active
    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
        .first()
    )
    subscription_active = sub is not None and sub.status in {"active", "trialing"}

    # Notes: Start with zero risk and add penalties for missing activity
    score = 0.0
    if session_count == 0:
        score += 0.25
    if journal_count < 2:
        score += 0.25
    if interaction_count == 0:
        score += 0.25
    if not subscription_active:
        score += 0.25

    # Notes: Map score to human readable category
    if score < 0.34:
        category = RiskCategory.LOW
    elif score < 0.67:
        category = RiskCategory.MEDIUM
    else:
        category = RiskCategory.HIGH

    # Notes: Persist the churn risk record
    risk = ChurnRisk(
        user_id=user_id,
        risk_score=score,
        risk_category=category,
        calculated_at=now,
    )
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return risk


def list_churn_risks(db: Session, limit: int = 100, offset: int = 0) -> list[ChurnRisk]:
    """Return churn risk records ordered by most recent calculation."""

    return (
        db.query(ChurnRisk)
        .order_by(ChurnRisk.calculated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


def recalculate_all_churn_risk(db: Session) -> None:
    """Recalculate churn risk for every user in the system."""

    users = db.query(User).all()
    for user in users:
        calculate_churn_risk(db, user.id)
