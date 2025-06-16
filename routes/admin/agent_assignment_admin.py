"""Admin route for assigning AI agents to users."""

# Notes: Import FastAPI tools and dependencies
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from services import user_service, agent_assignment_service
from models.user import User
from schemas.agent_assignment_schemas import (
    AdminAgentAssignmentRequest,
    AgentAssignmentResponse,
)

# Notes: Prefix exposes this endpoint under /admin/agent-assignments
router = APIRouter(prefix="/admin/agent-assignments", tags=["admin"])


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AgentAssignmentResponse)
def assign_agent_to_user(
    payload: AdminAgentAssignmentRequest,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AgentAssignmentResponse:
    """Assign a domain agent to the given user."""
    # Notes: Ensure the target user exists before assignment
    user = user_service.get_user(db, payload.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Notes: Delegate creation of the assignment to the service layer
    assignment = agent_assignment_service.assign_agent(db, payload.user_id, payload.agent_type)
    return assignment
