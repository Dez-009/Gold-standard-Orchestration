"""Endpoints for retrieving and redeeming referral codes."""

from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

# Notes: Dependency providing the authenticated user
from auth.dependencies import get_current_user
# Notes: Helper to obtain a database session for each request
from database.utils import get_db
# Notes: User model used for typing the dependency
from models.user import User
# Notes: Service layer containing referral business logic
from services import referral_service

# Notes: Create a router dedicated to referral operations
router = APIRouter(prefix="/referral", tags=["referral"])


@router.get("/code")
async def get_my_referral_code(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return or create the referral code for the authenticated user."""
    # Notes: Ensure the current user has a referral record
    record = referral_service.get_or_create_referral(db, current_user.id)
    # Notes: Respond with the code so it can be shared
    return {"referral_code": record.referral_code}


@router.post("/use")
async def use_referral_code(
    code: str = Body(...),
    new_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Redeem a referral code after signup."""
    # Notes: Attempt to associate the new user with the provided code
    record = referral_service.redeem_referral(db, code, new_user.id)
    if not record:
        # Notes: Invalid or already-used code results in an error
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid code")
    # Notes: Successful redemption returns a confirmation message
    return {"detail": "Referral applied"}
