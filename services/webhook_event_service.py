"""Service functions for listing and replaying webhook events."""

from typing import List, Dict

from utils.logger import get_logger

logger = get_logger()

# Static mock data used until a real storage backend is available
_MOCK_EVENTS = [
    {
        "id": "evt_test_1",
        "event_type": "payment_intent.succeeded",
        "created_at": "2023-01-01T12:00:00Z",
    },
    {
        "id": "evt_test_2",
        "event_type": "invoice.payment_failed",
        "created_at": "2023-01-02T15:30:00Z",
    },
]


def get_recent_webhook_events() -> List[Dict[str, str]]:
    """Return a list of recent webhook events."""
    # Notes: Simply return the in-memory mock data
    return _MOCK_EVENTS


def replay_webhook_event(event_id: str) -> None:
    """Placeholder function that simulates replaying a webhook."""
    # Notes: Log the request so we can verify on the server side
    logger.info("Replaying webhook event %s", event_id)
    # In a real implementation this would invoke business logic to resend
    # the webhook to the application's processing pipeline
