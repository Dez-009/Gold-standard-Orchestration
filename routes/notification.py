from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database.utils import get_db
from services import user_service, notification_service
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.post("/daily")
async def send_daily_notification(current_user: User = Depends(get_current_user)):
    """Trigger sending of a daily motivation notification for the user."""
    notification_service.send_daily_motivation(current_user)
    return {"detail": "Daily motivation sent"}


@router.post("/weekly")
async def send_weekly_notification(current_user: User = Depends(get_current_user)):
    """Trigger sending of a weekly check-in notification for the user."""
    notification_service.send_weekly_checkin(current_user)
    return {"detail": "Weekly check-in sent"}


@router.post("/action")
async def send_action_notification(
    reminder_text: str,
    current_user: User = Depends(get_current_user),
):
    """Send an action reminder notification with provided text."""
    notification_service.send_action_reminder(current_user, reminder_text)
    return {"detail": "Action reminder sent"}

