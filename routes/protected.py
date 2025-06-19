from fastapi import APIRouter, Depends, HTTPException, status

from models.user import User
from auth.dependencies import get_current_user

router = APIRouter(prefix="/protected", tags=["protected"])


@router.get("/test")
async def protected_test(current_user: User = Depends(get_current_user)):
    """Endpoint that requires a valid user token."""
    return {"message": "Access granted", "user_id": current_user.id}
