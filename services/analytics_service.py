"""Service for logging analytics events into the database."""

# Notes: SQLAlchemy session type used for DB access
from sqlalchemy.orm import Session

# Notes: Import the model representing analytics events
from models.analytics_event import AnalyticsEvent
import json


def log_analytics_event(
    db: Session, event_type: str, payload: dict, user_id: int | None = None
) -> AnalyticsEvent:
    """Persist a new analytics event record."""

    # Notes: Create the AnalyticsEvent object with provided details
    event = AnalyticsEvent(
        user_id=user_id,
        event_type=event_type,
        event_payload=json.dumps(payload),
    )
    # Notes: Add and commit the record to the database
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
