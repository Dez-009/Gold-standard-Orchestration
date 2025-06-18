"""Admin endpoints managing agent persona presets."""

# Notes: FastAPI imports for router and dependency handling
from fastapi import APIRouter, Depends, HTTPException, status
# Notes: SQLAlchemy session type
from sqlalchemy.orm import Session
# Notes: UUID type used for path parameters
from uuid import UUID

# Notes: Dependency enforcing admin authentication
from auth.dependencies import get_current_admin_user
# Notes: Provides DB session per-request
from database.utils import get_db
# Notes: User model for the dependency return type
from models.user import User
# Notes: Service layer containing CRUD logic
from services import persona_preset_service

# Notes: Prefix all endpoints with /admin/persona-presets
router = APIRouter(prefix="/admin/persona-presets", tags=["admin"])


@router.get("/")
def list_persona_presets(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return all available persona presets."""
    # Notes: Fetch every preset from the database
    presets = persona_preset_service.list_presets(db)
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "description": p.description,
            "traits": p.traits,
            "created_at": p.created_at.isoformat(),
        }
        for p in presets
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_persona_preset(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Create a new persona preset."""
    # Notes: Delegate validation and persistence to the service
    try:
        preset = persona_preset_service.create_preset(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return {
        "id": str(preset.id),
        "name": preset.name,
        "description": preset.description,
        "traits": preset.traits,
        "created_at": preset.created_at.isoformat(),
    }


@router.put("/{preset_id}")
def update_persona_preset(
    preset_id: str,
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Update an existing persona preset."""
    # Notes: Apply updates through the service layer
    try:
        preset = persona_preset_service.update_preset(db, preset_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {
        "id": str(preset.id),
        "name": preset.name,
        "description": preset.description,
        "traits": preset.traits,
        "created_at": preset.created_at.isoformat(),
    }


@router.delete("/{preset_id}")
def delete_persona_preset(
    preset_id: str,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Delete the specified persona preset."""
    # Notes: Remove the preset using the service helper
    try:
        persona_preset_service.delete_preset(db, preset_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return {"status": "deleted"}

# Footnote: Admin endpoints for CRUD on persona presets.

