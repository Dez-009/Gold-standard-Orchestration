"""User routes for managing agent personalization profiles."""

# Notes: Import FastAPI classes for routing and dependency injection
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Notes: Reuse existing authentication and DB session dependencies
from auth.dependencies import get_current_user
from database.utils import get_db
from models.user import User

# Notes: Import service providing personalization persistence
from services import agent_personalization_service
from services.agent_prompt_builder import VALID_AGENT_NAMES

router = APIRouter(prefix="/account/personalizations", tags=["account"])


@router.get("/")
def get_personalizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return available agent names and the user's personalization profiles."""

    # Notes: Retrieve all profiles owned by the user
    records = agent_personalization_service.list_agent_personalities(db, current_user.id)

    # Notes: Convert ORM objects into serializable dictionaries
    profiles = [
        {
            "id": str(r.id),
            "user_id": r.user_id,
            "agent_name": r.agent_name,
            "personality_profile": r.personality_profile,
            "created_at": r.created_at.isoformat(),
            "updated_at": r.updated_at.isoformat(),
        }
        for r in records
    ]

    # Notes: Return both the list of valid agent names and any existing profiles
    return {"agents": sorted(VALID_AGENT_NAMES), "profiles": profiles}


@router.post("/update")
def update_personalization(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Create or update the user's personalization profile."""

    # Notes: Validate that required fields exist in the request body
    agent_name = payload.get("agent_name")
    profile = payload.get("personality_profile")
    if not agent_name or profile is None:
        raise HTTPException(status_code=400, detail="Missing parameters")

    # Notes: Delegate record creation/update to the service layer
    record = agent_personalization_service.set_agent_personality(
        db, current_user.id, agent_name, profile
    )

    # Notes: Return the persisted record as primitives
    return {
        "id": str(record.id),
        "user_id": record.user_id,
        "agent_name": record.agent_name,
        "personality_profile": record.personality_profile,
        "created_at": record.created_at.isoformat(),
        "updated_at": record.updated_at.isoformat(),
    }

# Footnote: Exposes endpoints for end users to customize agent behavior.
