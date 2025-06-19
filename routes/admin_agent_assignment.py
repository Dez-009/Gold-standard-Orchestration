"""Admin API routes for assigning specific agents to users."""

# Notes: FastAPI utilities for routing and dependency injection
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Notes: Import authentication dependency to ensure admin access
from auth.dependencies import get_current_admin_user
# Notes: Database session provider
from database.utils import get_db
# Notes: User model for type hinting
from models.user import User

# Notes: Service layer encapsulating assignment logic
from services import admin_agent_assignment_service, user_service
# Notes: Pydantic schemas defining request and response bodies
from schemas.admin_agent_assignment import (
    AdminAgentAssignmentRequest,
    AdminAgentAssignmentResponse,
)

# Notes: Router configured under the /admin/agent-assignments path
router = APIRouter(prefix="/admin/agent-assignments", tags=["admin"])


@router.get("/")
def list_assignments(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0,
) -> list[dict]:
    """Return a paginated list of current agent assignments."""
    return admin_agent_assignment_service.list_agent_assignments(db, limit, offset)


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AdminAgentAssignmentResponse)
def assign_agent_to_user(
    payload: AdminAgentAssignmentRequest,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AdminAgentAssignmentResponse:
    """Assign a specific agent to the given user and domain."""

    # Notes: Validate the target user exists before assigning
    user = user_service.get_user(db, payload.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Notes: Delegate persistence to the service layer
    assignment = admin_agent_assignment_service.assign_agent(
        db,
        payload.user_id,
        payload.domain,
        payload.assigned_agent,
    )
    return AdminAgentAssignmentResponse(
        id=assignment.id,
        user_id=assignment.user_id,
        domain=assignment.domain,
        assigned_agent=payload.assigned_agent,
        assigned_at=assignment.assigned_at,
    )
