"""Service functions for behavioral insights."""

from __future__ import annotations

# Notes: Import datetime for timestamp generation
from datetime import datetime
from sqlalchemy.orm import Session

# Notes: Import the ORM model representing stored insights
from models.behavioral_insights import BehavioralInsight, InsightType


def generate_and_store_behavioral_insight(
    db: Session, user_id: int, source_data: dict
) -> BehavioralInsight:
    """Analyze the provided data and persist a new insight."""

    # Notes: Very simple analysis counting provided objects
    journals = source_data.get("journals", [])
    goals = source_data.get("goals", [])
    checkins = source_data.get("checkins", [])

    # Notes: Compose a short descriptive insight
    insight_text = (
        f"Analyzed {len(journals)} journals, {len(goals)} goals and "
        f"{len(checkins)} check-ins."
    )

    # Notes: Create the ORM object representing this insight
    insight = BehavioralInsight(
        user_id=user_id,
        insight_text=insight_text,
        insight_type=source_data.get("type", InsightType.JOURNAL),
        created_at=datetime.utcnow(),
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


def list_behavioral_insights(db: Session, user_id: int) -> list[BehavioralInsight]:
    """Return all insights associated with the given user."""

    return (
        db.query(BehavioralInsight)
        .filter(BehavioralInsight.user_id == user_id)
        .order_by(BehavioralInsight.created_at.desc())
        .all()
    )
