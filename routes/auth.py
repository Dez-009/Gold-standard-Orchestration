from fastapi import APIRouter, Depends, HTTPException, Request, status
import urllib.parse
from sqlalchemy.orm import Session

from database.utils import get_db
from services import user_service
from utils.password_utils import verify_password
from auth.auth_utils import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(request: Request, db: Session = Depends(get_db)):
    """Authenticate user and return an access token."""
    body = await request.body()
    form_data = dict(urllib.parse.parse_qsl(body.decode()))
    username = form_data.get("username")
    password = form_data.get("password")
    if not username or not password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Missing credentials")
    user = user_service.get_user_by_email(db, username)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"user_id": user.id})
    return {"access_token": token, "token_type": "bearer"}
