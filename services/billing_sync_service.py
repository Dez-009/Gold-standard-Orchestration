"""Background task to synchronize subscription status from Stripe."""

from datetime import datetime
from sqlalchemy.orm import Session

from services.billing_service import get_subscription_from_stripe
from services import audit_log_service
from database.session import SessionLocal
from models.subscription import Subscription
from utils.logger import get_logger

logger = get_logger()


def _process_subscription(db: Session, sub: Subscription) -> None:
    """Update a single subscription record from Stripe."""
    # Notes: Attempt to load the latest subscription data from Stripe
    stripe_sub = get_subscription_from_stripe(sub.stripe_subscription_id)
    if not stripe_sub:
        # Notes: If the API call failed, skip updating this subscription
        return
    new_status = stripe_sub.get("status", sub.status)
    cancel_at_ts = stripe_sub.get("cancel_at")
    period_end_ts = stripe_sub.get("current_period_end")
    cancel_at = datetime.fromtimestamp(cancel_at_ts) if cancel_at_ts else None
    period_end = datetime.fromtimestamp(period_end_ts) if period_end_ts else None
    changed = False
    if sub.status != new_status:
        sub.status = new_status
        changed = True
    if sub.cancel_at != cancel_at:
        sub.cancel_at = cancel_at
        changed = True
    if sub.current_period_end != period_end:
        sub.current_period_end = period_end
        changed = True
    if changed:
        db.commit()
        # Notes: Record an audit log entry when any fields change
        audit_log_service.create_audit_log(
            db,
            {
                "user_id": sub.user_id,
                "action": "subscription_update",
                "detail": new_status,
            },
        )


def sync_subscriptions() -> None:
    """Synchronize all known subscriptions with Stripe."""
    db = SessionLocal()
    try:
        # Notes: Iterate over every subscription record in the database
        for sub in db.query(Subscription).all():
            try:
                _process_subscription(db, sub)
            except Exception as exc:  # pylint: disable=broad-except
                # Notes: Log errors but continue syncing other subscriptions
                logger.exception("Error processing subscription %s: %s", sub.id, exc)
        db.close()
    except Exception:
        db.close()
        raise
