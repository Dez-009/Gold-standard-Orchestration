"""Admin routes for managing dynamic user segments."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from models.user_segment import UserSegment
from services.segmentation_service import (
    create_segment,
    update_segment,
    delete_segment,
    evaluate_segment,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/segments")
def list_segments(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return all defined segments."""
    segments = db.query(UserSegment).all()
    result = []
    for seg in segments:
        result.append(
            {
                "id": str(seg.id),
                "name": seg.name,
                "description": seg.description,
                "criteria": json.loads(seg.criteria_json or "{}"),
                "created_at": seg.created_at.isoformat(),
                "updated_at": seg.updated_at.isoformat(),
            }
        )
    return result


@router.post("/segments", status_code=status.HTTP_201_CREATED)
def create_segment_route(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Create a new user segment."""
    seg = create_segment(db, payload)
    return {"id": str(seg.id), "name": seg.name}


@router.put("/segments/{segment_id}")
def update_segment_route(
    segment_id: str,
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Update an existing segment by id."""
    seg = update_segment(db, segment_id, payload)
    if seg is None:
        raise HTTPException(status_code=404, detail="Segment not found")
    return {"id": str(seg.id), "name": seg.name}


@router.delete("/segments/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_segment_route(
    segment_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a segment from the system."""
    success = delete_segment(db, segment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Segment not found")


@router.get("/segments/{segment_id}/evaluate")
def evaluate_segment_route(
    segment_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return users matching the specified segment."""
    users = evaluate_segment(db, segment_id)
    return [
        {
            "id": u.id,
            "email": u.email,
            "role": u.role,
        }
        for u in users
    ]
