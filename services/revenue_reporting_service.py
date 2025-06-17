"""Service providing detailed revenue reports for administrators."""

# Notes: Import datetime utilities for time-based aggregations
from datetime import datetime, timedelta
from typing import Dict

# Notes: SQLAlchemy helpers for building aggregation queries
from sqlalchemy.orm import Session
from sqlalchemy import func

# Notes: Import models representing subscriptions and users
from models.subscription import Subscription
from models.user import User

# Notes: Reuse the pricing constant from the existing revenue service
from services.revenue_service import CURRENT_PLAN_PRICE
# Notes: Payment events are simulated via the webhook service
from services.webhook_event_service import get_recent_webhook_events


def generate_revenue_report(db: Session) -> Dict[str, float]:
    """Return a dictionary of key revenue metrics."""

    # Notes: Count active subscriptions recorded in the database
    active_subs = (
        db.query(func.count(Subscription.id))
        .filter(Subscription.status == "active")
        .scalar()
        or 0
    )

    # Notes: Count subscriptions that have churned/canceled
    churned_subs = (
        db.query(func.count(Subscription.id))
        .filter(Subscription.status == "canceled")
        .scalar()
        or 0
    )

    # Notes: Compute monthly recurring revenue based on active subscribers
    mrr = active_subs * CURRENT_PLAN_PRICE
    # Notes: Annual recurring revenue is simply twelve months of MRR
    arr = mrr * 12

    # Notes: Retrieve payment events to estimate total revenue by month
    events = get_recent_webhook_events()
    payments = [
        datetime.fromisoformat(e["created_at"].replace("Z", "+00:00"))
        for e in events
        if e.get("event_type") == "payment_intent.succeeded"
    ]
    revenue_by_month: Dict[str, float] = {}
    for ts in payments:
        key = ts.strftime("%Y-%m")
        revenue_by_month[key] = revenue_by_month.get(key, 0.0) + CURRENT_PLAN_PRICE

    # Notes: Determine revenue for the current and previous months
    now = datetime.utcnow().replace(day=1)
    this_month_key = now.strftime("%Y-%m")
    last_month_key = (now - timedelta(days=1)).replace(day=1).strftime("%Y-%m")
    current_rev = revenue_by_month.get(this_month_key, 0.0)
    last_rev = revenue_by_month.get(last_month_key, 0.0)

    # Notes: Calculate percentage growth compared to last month
    growth = ((current_rev - last_rev) / last_rev * 100) if last_rev else 0.0

    # Notes: Average revenue per user across all registered users
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_revenue = sum(revenue_by_month.values())
    arpu = (total_revenue / total_users) if total_users else 0.0

    return {
        "active_subscribers": active_subs,
        "churned_subscribers": churned_subs,
        "mrr": mrr,
        "arr": arr,
        "arpu": arpu,
        "revenue_growth": growth,
    }
