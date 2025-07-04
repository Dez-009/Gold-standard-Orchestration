"""Business logic for creating and evaluating user segments."""

# Notes: Standard imports for JSON handling
import json
from typing import Any, List

# Notes: SQLAlchemy session and aggregate helpers
from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID

# Notes: Import the models required for filtering
from models import (
    User,
    Subscription,
    ChurnRisk,
    UserSession,
    UserPersonality,
    Personality,
    UserSegment,
)


def create_segment(db: Session, data: dict) -> UserSegment:
    """Persist a new segment defined by the admin UI."""
    segment = UserSegment(
        name=data["name"],
        description=data.get("description"),
        criteria_json=json.dumps(data.get("criteria", {})),
    )
    db.add(segment)
    db.commit()
    db.refresh(segment)
    return segment


def update_segment(db: Session, segment_id: str | UUID, data: dict) -> UserSegment | None:
    """Update the stored definition of a segment."""
    seg_id = UUID(segment_id) if isinstance(segment_id, str) else segment_id
    # Notes: use session.get for updated SQLAlchemy API
    segment = db.get(UserSegment, seg_id)
    if segment is None:
        return None
    segment.name = data.get("name", segment.name)
    segment.description = data.get("description", segment.description)
    if "criteria" in data:
        segment.criteria_json = json.dumps(data["criteria"])
    db.commit()
    db.refresh(segment)
    return segment


def delete_segment(db: Session, segment_id: str | UUID) -> bool:
    """Remove the given segment record."""
    seg_id = UUID(segment_id) if isinstance(segment_id, str) else segment_id
    # Notes: use session.get for retrieval
    segment = db.get(UserSegment, seg_id)
    if segment is None:
        return False
    db.delete(segment)
    db.commit()
    return True


def _apply_subscription_filter(query, db: Session, criteria: dict[str, Any]):
    """Apply subscription tier rules to the query if provided."""
    if "subscription_status" not in criteria:
        return query
    subq = (
        db.query(
            Subscription.user_id,
            func.max(Subscription.created_at).label("max_time"),
        )
        .group_by(Subscription.user_id)
        .subquery()
    )
    latest = (
        db.query(Subscription)
        .join(
            subq,
            (Subscription.user_id == subq.c.user_id)
            & (Subscription.created_at == subq.c.max_time),
        )
        .subquery()
    )
    query = query.join(latest, latest.c.user_id == User.id)
    query = query.filter(latest.c.status == criteria["subscription_status"])
    return query


def _apply_churn_filter(query, db: Session, criteria: dict[str, Any]):
    """Apply churn risk score filters when configured."""
    if not any(k in criteria for k in ("min_churn_score", "max_churn_score", "risk_category")):
        return query
    subq = (
        db.query(ChurnRisk.user_id, func.max(ChurnRisk.calculated_at).label("max_time"))
        .group_by(ChurnRisk.user_id)
        .subquery()
    )
    latest = (
        db.query(ChurnRisk)
        .join(
            subq,
            (ChurnRisk.user_id == subq.c.user_id)
            & (ChurnRisk.calculated_at == subq.c.max_time),
        )
        .subquery()
    )
    query = query.join(latest, latest.c.user_id == User.id)
    if "min_churn_score" in criteria:
        query = query.filter(latest.c.risk_score >= criteria["min_churn_score"])
    if "max_churn_score" in criteria:
        query = query.filter(latest.c.risk_score <= criteria["max_churn_score"])
    if "risk_category" in criteria:
        query = query.filter(latest.c.risk_category == criteria["risk_category"])
    return query


def _apply_personality_filter(query, criteria: dict[str, Any]):
    """Filter by personality assignment when specified."""
    if "personality_type" not in criteria:
        return query
    query = query.join(UserPersonality, UserPersonality.user_id == User.id)
    query = query.join(Personality, Personality.id == UserPersonality.personality_id)
    query = query.filter(Personality.name == criteria["personality_type"])
    return query


def _apply_session_filter(query, db: Session, criteria: dict[str, Any]):
    """Apply active session count rules to the query."""
    if not any(k in criteria for k in ("min_sessions", "max_sessions")):
        return query
    subq = (
        db.query(UserSession.user_id, func.count(UserSession.id).label("session_count"))
        .group_by(UserSession.user_id)
        .subquery()
    )
    query = query.join(subq, subq.c.user_id == User.id)
    if "min_sessions" in criteria:
        query = query.filter(subq.c.session_count >= criteria["min_sessions"])
    if "max_sessions" in criteria:
        query = query.filter(subq.c.session_count <= criteria["max_sessions"])
    return query


def evaluate_segment(db: Session, segment_id: str | UUID) -> List[User]:
    """Return the users matching the segment criteria."""
    seg_id = UUID(segment_id) if isinstance(segment_id, str) else segment_id
    # Notes: session.get avoids deprecated Query.get
    segment = db.get(UserSegment, seg_id)
    if segment is None:
        return []

    criteria: dict[str, Any] = json.loads(segment.criteria_json or "{}")

    query = db.query(User)
    query = _apply_subscription_filter(query, db, criteria)
    query = _apply_churn_filter(query, db, criteria)
    query = _apply_personality_filter(query, criteria)
    query = _apply_session_filter(query, db, criteria)

    return query.all()
