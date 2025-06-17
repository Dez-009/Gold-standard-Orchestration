"""Service for computing revenue metrics for admin dashboards."""

# Notes: Typing imports for function annotations
from typing import Dict

# Notes: SQLAlchemy Session and aggregation helpers
from sqlalchemy.orm import Session
from sqlalchemy import func

# Notes: Import Subscription model to count active subscriptions
from models.subscription import Subscription
# Notes: Import webhook helper to count payment events
from services.webhook_event_service import get_recent_webhook_events

# Notes: Static monthly price used for revenue calculations
CURRENT_PLAN_PRICE = 10.0


def get_revenue_summary(db: Session) -> Dict[str, float]:
    """Return aggregated revenue statistics."""
    # Notes: Count subscriptions marked as active in the database
    active = (
        db.query(func.count(Subscription.id))
        .filter(Subscription.status == "active")
        .scalar()
        or 0
    )

    # Notes: Monthly recurring revenue based on active subs
    mrr = active * CURRENT_PLAN_PRICE
    # Notes: Annual recurring revenue is simple multiple of MRR
    arr = mrr * 12

    # Notes: Tally webhook events representing successful payments
    events = get_recent_webhook_events()
    successes = [e for e in events if e.get("event_type") == "payment_intent.succeeded"]
    lifetime = len(successes) * CURRENT_PLAN_PRICE

    return {
        "active_subscriptions": active,
        "mrr": mrr,
        "arr": arr,
        "lifetime_revenue": lifetime,
    }
