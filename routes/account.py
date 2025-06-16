"""Endpoints for retrieving user account details."""

# Notes: Import FastAPI tools for routing and dependency injection
from fastapi import APIRouter, Depends, status

# Notes: Import SQLAlchemy Session type for potential DB lookups
from sqlalchemy.orm import Session

# Notes: Dependency helpers to get DB session and authenticated user
from database.utils import get_db
from auth.dependencies import get_current_user

# Notes: Import the user model for typing the current_user dependency
from models.user import User

# Notes: Response schema describing account information
from schemas.account_schemas import AccountResponse
from schemas.agent_assignment_schemas import (
    AgentAssignmentRequest,
    AgentAssignmentResponse,
)
# Notes: Schemas for assigning personalities to the authenticated user
from schemas.user_personality_schemas import (
    UserPersonalityRequest,
    UserPersonalityResponse,
)
from services import user_service
from services import agent_assignment_service
# Notes: Import service managing personality assignments
from services import user_personality_service


# Notes: Create the router with a URL prefix
router = APIRouter(prefix="/account", tags=["account"])


@router.get("/", response_model=AccountResponse)
# Notes: Provide placeholder account details for the current user
async def read_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AccountResponse:
    """Return subscription tier and billing information."""
    # Notes: In this sprint we return static data; later this will query billing
    account_data = AccountResponse(tier="Free", billing="No payment method on file")
    return account_data


@router.delete("/delete", status_code=status.HTTP_204_NO_CONTENT)
# Notes: Permanently remove the authenticated user's account
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete the user record and cascade related data."""
    # Notes: Use the service layer to delete and commit
    user_service.delete_user(db, current_user)
    return None


@router.post(
    "/assign_agent",
    status_code=status.HTTP_201_CREATED,
    response_model=AgentAssignmentResponse,
)
# Notes: Assign a domain-specific AI agent to the authenticated user
async def assign_agent_route(
    payload: AgentAssignmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentAssignmentResponse:
    """Create a new agent assignment record and audit the action."""

    # Notes: Delegate to the service which persists the assignment
    assignment = agent_assignment_service.assign_agent(
        db, current_user.id, payload.domain
    )
    return assignment


@router.post(
    "/assign_personality",
    status_code=status.HTTP_201_CREATED,
    response_model=UserPersonalityResponse,
)
# Notes: Assign a personality preference for a specific coaching domain
async def assign_personality_route(
    payload: UserPersonalityRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserPersonalityResponse:
    """Create a personality assignment for the logged in user."""

    # Notes: Delegate creation to the service layer
    assignment = user_personality_service.assign_personality(
        db,
        current_user.id,
        payload.personality_id,
        payload.domain,
    )
    return assignment
