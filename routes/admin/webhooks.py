"""Admin routes for managing Stripe webhook events."""

from fastapi import APIRouter, Depends, Response, status

from auth.dependencies import get_current_admin_user
from models.user import User
from services.webhook_event_service import (
    get_recent_webhook_events,
    replay_webhook_event,
)

router = APIRouter(prefix="/admin/webhooks", tags=["admin"])


@router.get("/recent")
async def list_recent_webhooks(_: User = Depends(get_current_admin_user)) -> list[dict]:
    """Return a mocked list of recent webhook events."""
    # Notes: Delegate to the service which returns static mock data
    return get_recent_webhook_events()


@router.post("/replay", status_code=status.HTTP_200_OK)
async def replay_webhook(
    payload: dict, _: User = Depends(get_current_admin_user)
) -> Response:
    """Trigger a replay of the specified webhook event."""
    event_id = payload.get("event_id")
    if event_id:
        # Notes: Ask the service layer to perform (simulated) replay
        replay_webhook_event(event_id)
    return Response(status_code=status.HTTP_200_OK)
