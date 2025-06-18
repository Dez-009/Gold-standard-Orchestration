"""Admin endpoints for assigning persona tokens to users."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import persona_token_service, user_service

router = APIRouter(prefix="/admin/persona-tokens", tags=["admin"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def assign_persona_token(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Assign a persona token to a user."""

    user_id = payload.get("user_id")
    token_name = payload.get("token_name")
    if user_id is None or token_name is None:
        raise HTTPException(status_code=400, detail="Invalid payload")
    if user_service.get_user(db, user_id) is None:
        raise HTTPException(status_code=404, detail="User not found")
    record = persona_token_service.assign_token(db, int(user_id), str(token_name))
    return {
        "id": str(record.id),
        "user_id": record.user_id,
        "token_name": record.token_name,
        "description": record.description,
        "assigned_at": record.assigned_at.isoformat(),
    }


@router.get("/{user_id}")
def get_persona_token(
    user_id: int,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Retrieve the latest persona token for a user."""

    token = persona_token_service.get_token(db, user_id)
    if token is None:
        raise HTTPException(status_code=404, detail="Token not found")
    return {
        "id": str(token.id),
        "user_id": token.user_id,
        "token_name": token.token_name,
        "description": token.description,
        "assigned_at": token.assigned_at.isoformat(),
    }

# Footnote: Enables admin management of user persona tokens.
