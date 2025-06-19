"""Service layer for persisting user personality preferences."""

# Notes: Import datetime to record when assignments are made
from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from models.user import User
from models.user_personality import UserPersonality
from services.audit_log_service import create_audit_log


def assign_personality(
    db: Session, user_id: int, personality_id: UUID, domain: str
) -> UserPersonality:
    """Persist a personality assignment and audit the action."""

    # Notes: Create the ORM instance representing the preference
    assignment = UserPersonality(
        user_id=user_id,
        personality_id=personality_id,
        domain=domain,
        assigned_at=datetime.utcnow(),
    )

    # Notes: Save the new record to the database
    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # Notes: Capture the assignment event for traceability
    create_audit_log(
        db,
        {"user_id": user_id, "action": "assign_personality", "detail": domain},
    )

    return assignment


def create_or_update_assignment(
    db: Session,
    admin_user_id: int,
    user_id: int,
    personality_id: UUID,
    domain: str,
) -> UserPersonality:
    """Create or update a personality assignment for a user."""

    # Notes: Retrieve existing record if one matches user and domain
    assignment = (
        db.query(UserPersonality)
        .filter(
            UserPersonality.user_id == user_id,
            UserPersonality.domain == domain,
        )
        .first()
    )

    if assignment:
        # Notes: Update fields on the existing record
        assignment.personality_id = personality_id
        assignment.assigned_at = datetime.utcnow()
    else:
        # Notes: No record found; create a new one
        assignment = UserPersonality(
            user_id=user_id,
            personality_id=personality_id,
            domain=domain,
            assigned_at=datetime.utcnow(),
        )
        db.add(assignment)

    # Notes: Persist changes to the database
    db.commit()
    db.refresh(assignment)

    # Notes: Log the admin action for auditing purposes
    create_audit_log(
        db,
        {
            "user_id": admin_user_id,
            "action": "user_personality_update",
            "detail": str({"assigned_user": user_id, "domain": domain}),
        },
    )

    return assignment


def list_assignments(db: Session) -> list[dict]:
    """Return all personality assignments joined with user emails."""

    # Notes: Query assignments along with their associated user
    rows = db.query(UserPersonality, User.email).join(User, UserPersonality.user_id == User.id).all()

    assignments: list[dict] = []
    # Notes: Convert ORM results into dictionaries for API consumers
    for assignment, email in rows:
        assignments.append(
            {
                "user_email": email,
                "domain": assignment.domain,
                "personality_id": str(assignment.personality_id),
                "assigned_at": assignment.assigned_at.isoformat(),
            }
        )

    return assignments
