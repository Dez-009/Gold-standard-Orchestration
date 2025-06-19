"""Service functions for admin agent assignments using personalities."""

# Notes: Standard library imports
from datetime import datetime
from uuid import UUID
import json

# Notes: SQLAlchemy session class
from sqlalchemy.orm import Session

# Notes: ORM models needed to store assignments
from models.user import User
from models.personality import Personality
from models.user_personality import UserPersonality

# Notes: Audit log service records admin actions
from services.audit_log_service import create_audit_log
from models.audit_log import AuditEventType


def list_agent_assignments(db: Session, limit: int = 100, offset: int = 0) -> list[dict]:
    """Return assignment records joined with user and personality info."""

    # Notes: Query the assignments along with user email and personality name
    rows = (
        db.query(UserPersonality, User.email, Personality.name)
        .join(User, UserPersonality.user_id == User.id)
        .join(Personality, UserPersonality.personality_id == Personality.id)
        .offset(offset)
        .limit(limit)
        .all()
    )

    assignments: list[dict] = []
    # Notes: Convert ORM results into dictionaries for the API response
    for assignment, email, personality_name in rows:
        assignments.append(
            {
                "user_id": assignment.user_id,
                "user_email": email,
                "domain": assignment.domain,
                "assigned_agent": personality_name,
                "assigned_at": assignment.assigned_at.isoformat(),
            }
        )

    return assignments


def assign_agent(db: Session, user_id: int, domain: str, assigned_agent: str) -> UserPersonality:
    """Create or update a personality assignment for a user/domain."""

    # Notes: Resolve the agent personality by name
    personality = (
        db.query(Personality).filter(Personality.name == assigned_agent).first()
    )
    if personality is None:
        raise ValueError("Personality not found")

    # Notes: Fetch existing assignment to update instead of creating new
    assignment = (
        db.query(UserPersonality)
        .filter(UserPersonality.user_id == user_id, UserPersonality.domain == domain)
        .first()
    )

    if assignment:
        # Notes: Update the assigned personality and timestamp
        assignment.personality_id = personality.id
        assignment.assigned_at = datetime.utcnow()
    else:
        # Notes: Create a new assignment record if none exists
        assignment = UserPersonality(
            user_id=user_id,
            domain=domain,
            personality_id=personality.id,
            assigned_at=datetime.utcnow(),
        )
        db.add(assignment)

    # Notes: Persist the changes to the database
    db.commit()
    db.refresh(assignment)

    # Notes: Record the admin operation in the audit log using structured detail
    create_audit_log(
        db,
        {
            "user_id": user_id,
            "action": AuditEventType.AGENT_ASSIGNMENT.value,
            "detail": json.dumps(
                {
                    "user_id": user_id,
                    "domain": domain,
                    "assigned_agent": assigned_agent,
                }
            ),
        },
    )

    return assignment
