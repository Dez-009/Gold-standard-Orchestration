"""Admin endpoints for managing agent prompt templates."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from auth.dependencies import get_current_admin_user
from database.utils import get_db
from models.user import User
from services import prompt_version_service

router = APIRouter(prefix="/admin/prompt-versions", tags=["admin"])


@router.get("/")
def list_prompt_versions(
    agent_name: str | None = None,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return prompt versions optionally filtered by agent."""

    versions = prompt_version_service.list_prompt_versions(db, agent_name)
    return [
        {
            "id": str(v.id),
            "agent_name": v.agent_name,
            "version": v.version,
            "prompt_template": v.prompt_template,
            "metadata": v.metadata_json,
            "created_at": v.created_at.isoformat(),
        }
        for v in versions
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_prompt_version_route(
    payload: dict,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Create a new prompt version for an agent."""

    if not payload.get("agent_name") or not payload.get("version"):
        raise HTTPException(status_code=400, detail="Missing fields")
    record = prompt_version_service.create_prompt_version(
        db,
        payload["agent_name"],
        payload["version"],
        payload.get("prompt_template", ""),
        payload.get("metadata"),
    )
    return {
        "id": str(record.id),
        "agent_name": record.agent_name,
        "version": record.version,
        "prompt_template": record.prompt_template,
        "metadata": record.metadata_json,
        "created_at": record.created_at.isoformat(),
    }

# Footnote: Admin CRUD API for versioned prompt templates.
