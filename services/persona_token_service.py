"""Service functions for assigning and enforcing persona tokens.

Persona tokens define coaching styles such as "quick_rebounder" that
modify how agents reply. The helpers below persist assignments and
produce prompt snippets so orchestration can inject the traits.
"""

from __future__ import annotations

# Notes: Import datetime for timestamping assignments
from datetime import datetime

from sqlalchemy.orm import Session

from models.persona_token import PersonaToken
from services.audit_log_service import create_audit_log


# Notes: Persist a token assignment for a user

def assign_token(db: Session, user_id: int, token_name: str, description: str = "") -> PersonaToken:
    """Create a persona token record for the user."""

    token = PersonaToken(
        user_id=user_id,
        token_name=token_name,
        description=description,
        assigned_at=datetime.utcnow(),
    )
    db.add(token)
    db.commit()
    db.refresh(token)

    # Notes: Record the assignment event for auditing
    create_audit_log(
        db,
        {"user_id": user_id, "action": "persona_token_assigned", "detail": token_name},
    )

    return token


# Notes: Retrieve the latest token assigned to a user

def get_token(db: Session, user_id: int) -> PersonaToken | None:
    """Return the most recent persona token for the user."""

    return (
        db.query(PersonaToken)
        .filter(PersonaToken.user_id == user_id)
        .order_by(PersonaToken.assigned_at.desc())
        .first()
    )


# Notes: List all tokens for history purposes

def list_all_tokens(db: Session, user_id: int) -> list[PersonaToken]:
    """Return every persona token for the user."""

    return (
        db.query(PersonaToken)
        .filter(PersonaToken.user_id == user_id)
        .order_by(PersonaToken.assigned_at.desc())
        .all()
    )


# Notes: Adjust the prompt text based on the token description

def enforce_token(agent_name: str, user_token: PersonaToken | None) -> str:
    """Return a text snippet describing the user's persona token."""

    if user_token is None:
        return ""
    description = user_token.description or ""
    return f"This user is a {user_token.token_name}: {description}"


# Footnote: Provides CRUD helpers for persona tokens and injects token context.
