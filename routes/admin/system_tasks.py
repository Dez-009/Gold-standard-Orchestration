"""Routes to trigger background system tasks for administrators."""

from fastapi import APIRouter, Depends, Response, status

from auth.dependencies import get_current_admin_user
from services.billing_sync_service import sync_subscriptions
from services.billing_reminder_service import send_renewal_reminders
from models.user import User

router = APIRouter(prefix="/admin/system", tags=["admin"])


@router.post("/sync_subscriptions", status_code=status.HTTP_200_OK)
def trigger_subscription_sync(_: User = Depends(get_current_admin_user)) -> Response:
    """Endpoint allowing admins to manually sync subscription data."""
    # Notes: Execute the synchronization immediately when the endpoint is called
    sync_subscriptions()
    return Response(status_code=status.HTTP_200_OK)


@router.post("/send_renewal_reminders", status_code=status.HTTP_200_OK)
def trigger_renewal_reminders(_: User = Depends(get_current_admin_user)) -> Response:
    """Endpoint allowing admins to send upcoming renewal reminders."""
    # Notes: Execute reminder delivery immediately when triggered
    send_renewal_reminders()
    return Response(status_code=status.HTTP_200_OK)
