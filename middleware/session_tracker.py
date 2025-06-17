"""Middleware for tracking user session lifecycle."""

# Notes: Types for FastAPI middleware and responses
from typing import Callable

from fastapi import FastAPI, Request, Response
from fastapi import HTTPException

# Notes: Utility for verifying JWT tokens
from auth.auth_utils import verify_access_token

# Notes: Database session factory
from database.session import SessionLocal

# Notes: Service layer functions operating on UserSession
from services import user_session_service


async def session_tracker_middleware(request: Request, call_next: Callable) -> Response:
    """Track user sessions by closing them on logout or auth failure."""

    # Notes: Extract user id from the Authorization header if present
    auth_header = request.headers.get("Authorization", "")
    user_id: int | None = None
    if auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1]
        try:
            payload = verify_access_token(token)
            user_id = payload.get("user_id")
        except HTTPException:
            # Notes: Invalid tokens will be handled downstream
            user_id = None

    try:
        response = await call_next(request)
    except HTTPException as exc:
        # Notes: Close the session when authentication fails
        if exc.status_code == 401 and user_id is not None:
            db = SessionLocal()
            try:
                user_session_service.end_session(db, user_id)
            finally:
                db.close()
        raise

    # Notes: Close the session when hitting the explicit logout route
    if request.url.path == "/auth/logout" and response.status_code == 200 and user_id is not None:
        db = SessionLocal()
        try:
            user_session_service.end_session(db, user_id)
        finally:
            db.close()

    return response


def init_session_tracker(app: FastAPI) -> None:
    """Attach the session tracker middleware to the application."""

    app.middleware("http")(session_tracker_middleware)
