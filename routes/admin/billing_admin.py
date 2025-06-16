"""Admin routes for viewing payments and issuing refunds."""

from fastapi import APIRouter, Depends, HTTPException, status

from auth.dependencies import get_current_admin_user
from services.billing_service import list_recent_payments, refund_charge
from models.user import User

router = APIRouter(prefix="/admin/billing", tags=["admin"])


@router.get("/payments")
def recent_payments(_: User = Depends(get_current_admin_user)) -> list[dict]:
    """Return the list of recent successful payments."""
    # Notes: Delegate retrieval to the billing service
    return list_recent_payments()


@router.post("/refund", status_code=status.HTTP_200_OK)
def refund_payment(
    charge_id: str,
    _: User = Depends(get_current_admin_user),
) -> dict[str, str]:
    """Attempt to refund the given charge id."""
    success = refund_charge(charge_id)
    if not success:
        # Notes: Surface a generic error when the refund fails
        raise HTTPException(status_code=400, detail="Refund failed")
    return {"status": "ok"}

