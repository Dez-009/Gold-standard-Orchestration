"""Service helpers for agent output flagging."""

from __future__ import annotations
from uuid import UUID

from sqlalchemy.orm import Session

from models.agent_output_flag import AgentOutputFlag
from models.journal_summary import JournalSummary
from utils.logger import get_logger

logger = get_logger()


def flag_agent_output(
    db: Session,
    agent_name: str,
    user_id: int,
    reason: str,
    summary_id: UUID | None = None,
) -> AgentOutputFlag:
    """Create a flag entry for manual review."""

    logger.info("Flagging output from %s for user %s", agent_name, user_id)
    if summary_id:
        summary = (
            db.query(JournalSummary).filter(JournalSummary.id == summary_id).first()
        )
        if summary is None:
            logger.warning("Summary %s not found; storing flag without link", summary_id)
            summary_id = None

    entry = AgentOutputFlag(
        agent_name=agent_name,
        user_id=user_id,
        summary_id=summary_id,
        reason=reason,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def list_flags(db: Session, reviewed: bool | None = None) -> list[AgentOutputFlag]:
    """Return flags optionally filtered by review status."""

    query = db.query(AgentOutputFlag).order_by(AgentOutputFlag.created_at.desc())
    if reviewed is not None:
        query = query.filter(AgentOutputFlag.reviewed == reviewed)
    return query.all()


def mark_flag_reviewed(db: Session, flag_id: str) -> AgentOutputFlag | None:
    """Set reviewed=True for the given flag id."""

    flag = db.query(AgentOutputFlag).filter(AgentOutputFlag.id == UUID(str(flag_id))).first()
    if not flag:
        return None
    flag.reviewed = True
    db.commit()
    db.refresh(flag)
    return flag

# Footnote: These helpers enable admin moderation workflows.
