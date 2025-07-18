from datetime import datetime, timedelta
from jose import jwt, JWTError
from fastapi import HTTPException, status

from utils.logger import get_logger
from config import get_settings

logger = get_logger()

# Notes: Load application configuration, including the JWT secret key
settings = get_settings()
SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Return a JWT access token encoding the given data."""
    logger.info("Creating JWT access token for user_id: %s", data.get("user_id"))
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> dict:
    """Verify a JWT and return its payload."""
    logger.info("Verifying JWT token.")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        logger.error("Invalid JWT token.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
