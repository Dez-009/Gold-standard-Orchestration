"""Admin route to list subscription history records."""

from fastapi import APIRouter, Depends

from auth.dependencies import get_current_admin_user
from models.user import User
from database.session import SessionLocal
from services.subscription_history_service import get_subscription_history

router = APIRouter(prefix="/admin/subscriptions", tags=["admin"])


@router.get("/history")
def list_subscription_history(
    _: User = Depends(get_current_admin_user),
) -> list[dict]:
    """Return all subscription history records."""
    db = SessionLocal()
    try:
        # Notes: Delegate retrieval to the service layer
        return get_subscription_history(db)
    finally:
        db.close()
