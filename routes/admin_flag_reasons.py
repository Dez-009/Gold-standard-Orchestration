"""Admin CRUD routes for flag reasons."""

from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import flag_reason_service

router = APIRouter(prefix="/admin/flag-reasons", tags=["admin"])


class FlagReasonCreate(BaseModel):
    """Schema for creating a new flag reason."""

    label: str
    category: str | None = None


@router.get("/")
def list_reasons(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return all flag reasons for admin dropdowns."""
    rows = flag_reason_service.list_flag_reasons(db)
    return [
        {
            "id": str(r.id),
            "label": r.label,
            "category": r.category,
            "created_at": r.created_at.isoformat(),
        }
        for r in rows
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_reason(
    data: FlagReasonCreate,
    admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Create a new flag reason."""
    reason = flag_reason_service.create_flag_reason(db, data.label, data.category)
    return {
        "id": str(reason.id),
        "label": reason.label,
        "category": reason.category,
        "created_at": reason.created_at.isoformat(),
    }


@router.delete("/{reason_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reason(
    reason_id: UUID,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Response:
    """Delete an existing reason."""
    ok = flag_reason_service.delete_flag_reason(db, reason_id)
    if not ok:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)

# Footnote: Routed under /admin for moderator access only.
