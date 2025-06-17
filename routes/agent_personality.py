"""Routes allowing users to select agent personalities."""

# Notes: FastAPI routing tools and dependency injection
from fastapi import APIRouter, Depends, HTTPException, status
# Notes: SQLAlchemy session type for persistence
from sqlalchemy.orm import Session

# Notes: Dependency helpers for authentication and DB access
from auth.dependencies import get_current_user
from database.utils import get_db
# Notes: User model representing the authenticated user
from models.user import User
# Notes: Service layer implementing assignment logic
from services import agent_personality_service
# Notes: Request and response schemas for this router
from schemas.agent_personality import (
    AgentPersonalityRequest,
    AgentPersonalityResponse,
)


router = APIRouter(prefix="/agent", tags=["agent"])


@router.post(
    "/personality-assignments",
    response_model=AgentPersonalityResponse,
    status_code=status.HTTP_201_CREATED,
)
def assign_personality(
    payload: AgentPersonalityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentPersonalityResponse:
    """Assign a personality to the current user for the given domain."""

    # Notes: Delegate to the service layer to persist the assignment
    assignment = agent_personality_service.assign_personality(
        db, current_user.id, payload.domain, payload.personality
    )

    # Notes: Convert the ORM result to the response schema
    return AgentPersonalityResponse(
        id=assignment.id,
        user_id=assignment.user_id,
        domain=assignment.domain,
        personality=assignment.personality.name,
        assigned_at=assignment.assigned_at,
    )


@router.get("/personality-assignments", response_model=AgentPersonalityResponse)
def get_personality(
    domain: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentPersonalityResponse:
    """Retrieve the personality assignment for the current user."""

    # Notes: Fetch assignment record from the database
    assignment = agent_personality_service.get_personality_assignment(
        db, current_user.id, domain
    )
    if assignment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    # Notes: Return the mapped response
    return AgentPersonalityResponse(
        id=assignment.id,
        user_id=assignment.user_id,
        domain=assignment.domain,
        personality=assignment.personality.name,
        assigned_at=assignment.assigned_at,
    )
