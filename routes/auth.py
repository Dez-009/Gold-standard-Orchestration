from fastapi import APIRouter, Depends, HTTPException, Request, status
import urllib.parse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.utils import get_db
from services import user_service, user_session_service
from utils.password_utils import verify_password
from auth.auth_utils import create_access_token
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    """Request body model for JSON-based login."""

    username: str
    password: str

@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    """Authenticate user using JSON or form payload and issue a token."""

    content_type = request.headers.get("content-type", "")
    if content_type.startswith("application/x-www-form-urlencoded"):
        form = await request.form()
        username = form.get("username")
        password = form.get("password")
    else:
        data = await request.json()
        login_data = LoginRequest(**data)
        username = login_data.username
        password = login_data.password

    # Ensure required credentials are provided
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")

    # Validate user and password against stored hash
    user = user_service.get_user_by_email(db, username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Issue a signed access token
    token = create_access_token({"user_id": user.id})

    # Notes: Capture request context for the session record
    user_agent = request.headers.get("user-agent")
    ip_addr = request.client.host if request.client else "unknown"
    user_session_service.start_session(db, user.id, user_agent, ip_addr)

    return {"access_token": token, "token_type": "bearer"}


@router.post("/logout")
def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """End the current user session."""

    user_session_service.end_session(db, current_user.id)
    return {"detail": "Logged out"}
