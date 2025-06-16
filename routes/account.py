"""Endpoints for retrieving user account details."""

# Notes: Import FastAPI tools for routing and dependency injection
from fastapi import APIRouter, Depends

# Notes: Import SQLAlchemy Session type for potential DB lookups
from sqlalchemy.orm import Session

# Notes: Dependency helpers to get DB session and authenticated user
from database.utils import get_db
from auth.dependencies import get_current_user

# Notes: Import the user model for typing the current_user dependency
from models.user import User

# Notes: Response schema describing account information
from schemas.account_schemas import AccountResponse


# Notes: Create the router with a URL prefix
router = APIRouter(prefix="/account", tags=["account"])


@router.get("/", response_model=AccountResponse)
# Notes: Provide placeholder account details for the current user
async def read_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountResponse:
    """Return subscription tier and billing information."""
    # Notes: In this sprint we return static data; later this will query billing
    account_data = AccountResponse(tier="Free", billing="No payment method on file")
    return account_data
