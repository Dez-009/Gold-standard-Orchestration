"""Service functions for admin agent assignment overrides."""

from datetime import datetime
from sqlalchemy.orm import Session

from models.agent_assignment_override import AgentAssignmentOverride
from uuid import UUID


def get_overrides(db: Session) -> list[AgentAssignmentOverride]:
    """Return all override records."""
    # Notes: Simple query returning every override entry
    return db.query(AgentAssignmentOverride).all()


def create_override(db: Session, user_id: int, agent_id: str) -> AgentAssignmentOverride:
    """Create a new override mapping the user to a specific agent."""
    # Notes: Convert the agent identifier from string to UUID object
    agent_uuid = UUID(agent_id)

    # Notes: Instantiate the override record with current timestamp
    override = AgentAssignmentOverride(
        user_id=user_id,
        agent_id=agent_uuid,
        assigned_at=datetime.utcnow(),
    )
    db.add(override)
    db.commit()
    db.refresh(override)
    return override
