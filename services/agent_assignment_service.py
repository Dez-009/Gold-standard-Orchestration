"""Service for assigning specialized AI agents to users."""

from datetime import datetime

from sqlalchemy.orm import Session

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
