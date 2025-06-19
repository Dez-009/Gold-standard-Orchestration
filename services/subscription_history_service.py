"""Service to retrieve subscription history for administrators."""

from sqlalchemy.orm import Session
from models.subscription import Subscription
from models.user import User


def get_subscription_history(db: Session) -> list[dict]:
    """Return subscription records joined with user emails."""
    # Notes: Query subscriptions joined with their related users
    rows = db.query(Subscription, User.email).join(User, Subscription.user_id == User.id).all()

    history: list[dict] = []
    # Notes: Convert ORM results into simple dictionaries for the API layer
    for sub, email in rows:
        history.append(
            {
                "user_email": email,
                "stripe_subscription_id": sub.stripe_subscription_id,
                "status": sub.status,
                "start_date": sub.created_at.isoformat(),
                "end_date": sub.current_period_end.isoformat() if sub.current_period_end else None,
                "updated_at": sub.updated_at.isoformat(),
            }
        )
    return history
