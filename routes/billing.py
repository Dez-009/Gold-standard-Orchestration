"""Routes for handling billing-related webhooks."""

from fastapi import APIRouter, Request, Response, status, HTTPException, Depends

from services.billing_service import handle_stripe_event, create_portal_session
from auth.dependencies import get_current_user
from models.user import User
from utils.logger import get_logger


router = APIRouter(prefix="/billing", tags=["billing"])

logger = get_logger()


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def stripe_webhook(request: Request) -> Response:
    """Receive and process events from Stripe."""
    # Notes: Read the raw request body needed for signature verification
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header:
        # Notes: Reject requests that are missing the signature header
        logger.warning("Stripe webhook missing signature header")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing signature")

    # Notes: Delegate event processing to the billing service
    handle_stripe_event(payload.decode(), sig_header)
    return Response(status_code=status.HTTP_200_OK)


@router.get("/portal")
async def get_billing_portal(
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    """Return a billing portal session URL for the authenticated user."""
    # Notes: Use the billing service to generate the session link
    url = create_portal_session()
    return {"url": url}
