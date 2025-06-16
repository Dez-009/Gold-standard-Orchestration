"""Service for assigning specialized AI agents to users."""

from datetime import datetime

from sqlalchemy.orm import Session
from models.user import User

from models.agent_assignment import AgentAssignment
from services.audit_log_service import create_audit_log


def assign_agent(db: Session, user_id: int, domain: str) -> AgentAssignment:
    """Persist an agent assignment and record an audit entry."""

    # Notes: Instantiate the ORM object representing the assignment
    assignment = AgentAssignment(
        user_id=user_id,
        agent_type=domain,
        assigned_at=datetime.utcnow(),
    )

    # Notes: Save the new assignment to the database
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # Notes: Record the action in the audit log for traceability
    create_audit_log(
        db,
        {"user_id": user_id, "action": "assign_agent", "detail": domain},
    )

    # Notes: The orchestration logic for selecting the actual AI model will be
    # implemented in the future. For now we simply store the domain value.
    return assignment


def create_or_update_assignment(
    db: Session,
    admin_user_id: int,
    user_id: int,
    agent_type: str,
) -> AgentAssignment:
    """Create or update an assignment and audit the admin action."""

    # Notes: Retrieve any existing assignment for the user
    assignment = (
        db.query(AgentAssignment)
        .filter(AgentAssignment.user_id == user_id)
        .first()
    )

    if assignment:
        # Notes: Update the existing agent type and timestamp
        assignment.agent_type = agent_type
        assignment.assigned_at = datetime.utcnow()
    else:
        # Notes: No record exists so create a new assignment instance
        assignment = AgentAssignment(
            user_id=user_id,
            agent_type=agent_type,
            assigned_at=datetime.utcnow(),
        )
        db.add(assignment)

    # Notes: Persist changes regardless of create or update operation
    db.commit()
    db.refresh(assignment)

    # Notes: Capture the admin action in the audit trail
    create_audit_log(
        db,
        {
            "user_id": admin_user_id,
            "action": "agent_assignment_update",
            "detail": str({"assigned_user": user_id, "agent_type": agent_type}),
        },
    )

    return assignment


def list_agent_assignments(db: Session) -> list[dict]:
    """Return all assignments joined with user email."""

    # Query assignments joined with user table to fetch the email
    rows = (
        db.query(AgentAssignment, User.email)
        .join(User, AgentAssignment.user_id == User.id)
        .all()
    )

    assignments: list[dict] = []
    # Convert ORM tuples into plain dictionaries
    for assignment, email in rows:
        assignments.append(
            {
                "user_email": email,
                "agent_type": assignment.agent_type,
                "assigned_at": assignment.assigned_at.isoformat(),
            }
        )

    return assignments
