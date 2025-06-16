"""Service functions related to billing and Stripe webhooks."""

from typing import Any
import stripe

from config import settings
from database.session import SessionLocal
from models.subscription import Subscription
from services import audit_log_service
from utils.logger import get_logger


logger = get_logger()

# Notes: Configure the Stripe client with the secret key so API calls are
# authenticated
stripe.api_key = settings.stripe_secret_key


def _update_subscription_status(db, sub_id: str, status: str, user_id: int | None) -> None:
    """Create or update a subscription record with the given status."""
    # Notes: Look for an existing subscription by the Stripe identifier
    subscription = db.query(Subscription).filter_by(
        stripe_subscription_id=sub_id
    ).first()
    if subscription is None:
        # Notes: Create a new local record if one does not exist
        subscription = Subscription(
            user_id=user_id,
            stripe_subscription_id=sub_id,
            status=status,
        )
        db.add(subscription)
    else:
        # Notes: Update the stored status and attach user if provided
        subscription.status = status
        if user_id and not subscription.user_id:
            subscription.user_id = user_id
    db.commit()


def handle_stripe_event(payload: str, sig_header: str) -> None:
    """Process an incoming Stripe webhook event."""
    # Notes: Open a database session to record results of the webhook
    db = SessionLocal()
    try:
        # Notes: Verify the webhook signature and parse the event
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except Exception as exc:  # pylint: disable=broad-except
        # Notes: If verification fails, log the problem and stop processing
        logger.exception("Failed to verify Stripe webhook: %s", exc)
        db.close()
        return

    event_type = event["type"]
    # Notes: Grab the data portion of the payload for easy access
    data: Any = event["data"]["object"]
    user_id = None
    if isinstance(data.get("metadata"), dict) and data["metadata"].get("user_id"):
        try:
            user_id = int(data["metadata"]["user_id"])
        except (TypeError, ValueError):
            # Notes: Ignore bad user identifiers and treat as unknown user
            user_id = None

    if event_type.startswith("customer.subscription"):
        # Notes: Subscription events contain the subscription id directly
        sub_id = data.get("id")
        status = data.get("status", "active")
        _update_subscription_status(db, sub_id, status, user_id)
    elif event_type == "invoice.payment_succeeded":
        # Notes: Invoice events reference the subscription id under 'subscription'
        sub_id = data.get("subscription")
        if sub_id:
            _update_subscription_status(db, sub_id, "active", user_id)
    elif event_type == "invoice.payment_failed":
        sub_id = data.get("subscription")
        if sub_id:
            _update_subscription_status(db, sub_id, "failed", user_id)

    # Notes: Persist an audit log entry regardless of event type
    audit_log_service.create_audit_log(
        db,
        {
            "user_id": user_id,
            "action": "stripe_event",
            "detail": event_type,
        },
    )
    db.close()
