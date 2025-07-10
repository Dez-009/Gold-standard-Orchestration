from fastapi import APIRouter, Depends, HTTPException, Request, status
import urllib.parse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from schemas.user_schemas import UserCreate, UserResponse

from database.utils import get_db
from services import user_service, user_session_service
from utils.password_utils import verify_password
from auth.auth_utils import create_access_token
from auth.dependencies import get_current_user
from models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(UserCreate):
    """Request model for new user registration."""
    pass


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: RegisterRequest, db: Session = Depends(get_db)) -> UserResponse:
    """Create a new user and return the created record."""
    existing = user_service.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    # Validate admin access code if user is registering as admin
    if user.role and user.role.lower() == "admin":
        if not user.access_code or user.access_code != "VIDA_ADMIN_2025":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="Invalid or missing admin access code"
            )

    # Remove access_code from user data before creating User object
    user_data = user.model_dump()
    user_data.pop('access_code', None)  # Remove access_code safely
    
    new_user = user_service.create_user(db, user_data)
    return new_user

@router.post("/login")
async def login(input: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Authenticate user and return an access token."""
    username = input.username
    password = input.password

    # Ensure required credentials are provided
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")

    # Validate user and password against stored hash
    user = user_service.get_user_by_email(db, username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Issue a signed access token
    token = create_access_token({"user_id": user.id, "role": user.role})

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
