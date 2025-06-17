"""Service functions for persisting and retrieving reflection prompts."""

from __future__ import annotations

# Notes: SQLAlchemy session type annotation
from sqlalchemy.orm import Session

# Notes: ORM model representing a reflection prompt
from models.reflection_prompt import ReflectionPrompt


# Notes: Persist a new reflection prompt tied to a journal entry

def create_prompt(
    db: Session, user_id: int, journal_id: int, prompt_text: str
) -> ReflectionPrompt:
    """Create and return a reflection prompt record."""

    prompt = ReflectionPrompt(
        user_id=user_id,
        journal_id=journal_id,
        prompt_text=prompt_text,
    )
    db.add(prompt)
    db.commit()
    db.refresh(prompt)
    return prompt


# Notes: Retrieve all prompts associated with a specific user

def get_prompts_by_user(db: Session, user_id: int) -> list[ReflectionPrompt]:
    """Return prompts ordered by newest first."""

    return (
        db.query(ReflectionPrompt)
        .filter(ReflectionPrompt.user_id == user_id)
        .order_by(ReflectionPrompt.created_at.desc())
        .all()
    )

# Footnote: The service provides simple CRUD utilities used by routes and pipelines.
