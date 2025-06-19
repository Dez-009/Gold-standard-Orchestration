"""Routes for submitting analytics events."""

# Notes: Import FastAPI utilities for routing and dependencies
from fastapi import APIRouter, Depends, Header
from fastapi import HTTPException

# Notes: SQLAlchemy session helper for DB access
from sqlalchemy.orm import Session

# Notes: JWT verification helper to optionally identify the user
from auth.auth_utils import verify_access_token
from database.utils import get_db
from services.analytics_service import log_analytics_event
from schemas.analytics_event import AnalyticsEventCreate, AnalyticsEventResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/event", response_model=AnalyticsEventResponse)
# Notes: Accept analytics event submissions, token optional
def submit_event(
    event: AnalyticsEventCreate,
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> AnalyticsEventResponse:
    """Persist an analytics event, associating it with a user when possible."""

    # Notes: Attempt to extract user id from Authorization header
    user_id = None
    if authorization:
        token = authorization.replace("Bearer ", "")
        try:
            payload = verify_access_token(token)
            user_id = payload.get("user_id")
        except HTTPException:
            # Notes: Invalid token results in anonymous event
            user_id = None

    # Notes: Delegate to the service layer to store the event
    record = log_analytics_event(
        db, event.event_type, event.event_payload, user_id=user_id
    )
    return record
