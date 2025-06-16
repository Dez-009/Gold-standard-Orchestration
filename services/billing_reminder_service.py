"""Utility for sending upcoming subscription renewal reminders."""

from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from database.session import SessionLocal
from models.subscription import Subscription
from services import audit_log_service
from utils.logger import get_logger


logger = get_logger()


def _compose_reminder(_sub: Subscription) -> str:
    """Return the reminder text for the given subscription."""
    # Notes: Placeholder message used until email integration is added
    return "Your subscription will renew soon."


def send_renewal_reminders(days: int = 7) -> None:
    """Log reminders for subscriptions renewing within the next ``days`` days."""
    db: Session = SessionLocal()
    try:
        # Notes: Calculate the timestamp threshold for upcoming renewals
        threshold = datetime.utcnow() + timedelta(days=days)
        # Notes: Query active subscriptions expiring on or before the threshold
        upcoming = (
            db.query(Subscription)
            .filter(Subscription.current_period_end != None)
            .filter(Subscription.current_period_end <= threshold)
            .filter(Subscription.status == "active")
            .all()
        )
        for sub in upcoming:
            # Notes: Create the reminder message (currently unused)
            message = _compose_reminder(sub)
            logger.info("Reminder for user %s: %s", sub.user_id, message)
            # Notes: Persist audit log entry for traceability
            audit_log_service.create_audit_log(
                db,
                {
                    "user_id": sub.user_id,
                    "action": "renewal_reminder",
                    "detail": message,
                },
            )
    finally:
        db.close()

