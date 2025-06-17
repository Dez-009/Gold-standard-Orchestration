"""Admin route for overriding user agent assignments."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth.dependencies import get_current_admin_user
from database.utils import get_db
from services import user_service, personality_service
from services import agent_assignment_service, agent_override_service
from models.user import User
from models.agent_assignment import AgentAssignment
from models.agent_assignment_override import AgentAssignmentOverride
from schemas.agent_override_schemas import AgentOverrideRequest, AgentOverrideResponse

router = APIRouter(prefix="/admin/agent-override", tags=["admin"])


@router.get("/")
def list_overrides(
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return all assignments with any admin overrides."""
    # Notes: Fetch existing assignments joined with user emails and ids
    rows = (
        db.query(AgentAssignment, User.email)
        .join(User, AgentAssignment.user_id == User.id)
        .all()
    )
    assignments: list[dict] = []
    for assignment, email in rows:
        assignments.append(
            {
                "user_id": assignment.user_id,
                "user_email": email,
                "agent_type": assignment.agent_type,
                "assigned_at": assignment.assigned_at.isoformat(),
            }
        )

    # Notes: Retrieve override records and attach user emails
    override_rows = (
        db.query(AgentAssignmentOverride, User.email)
        .join(User, AgentAssignmentOverride.user_id == User.id)
        .all()
    )
    overrides: list[dict] = []
    for override, email in override_rows:
        overrides.append(
            {
                "id": override.id,
                "user_id": override.user_id,
                "user_email": email,
                "agent_id": str(override.agent_id),
                "assigned_at": override.assigned_at.isoformat(),
            }
        )

    return {"assignments": assignments, "overrides": overrides}


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=AgentOverrideResponse)
def create_override(
    payload: AgentOverrideRequest,
    _: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> AgentOverrideResponse:
    """Create a new agent override for the specified user."""
    # Notes: Ensure the user exists before creating the override
    if user_service.get_user(db, payload.user_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    # Notes: Verify the agent (personality) exists before assignment
    if personality_service.get_personality(db, str(payload.agent_id)) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")

    # Notes: Persist the override using the service layer
    override = agent_override_service.create_override(db, payload.user_id, str(payload.agent_id))
    return override
