"""Service helpers for moderating summarized journals."""

from __future__ import annotations

from uuid import UUID
from sqlalchemy.orm import Session

from models.summarized_journal import SummarizedJournal


def flag_summary(db: Session, summary_id: UUID | str, reason: str) -> SummarizedJournal | None:
    """Mark a summary as flagged and store the reason."""

    sid = UUID(str(summary_id))
    summary = db.query(SummarizedJournal).get(sid)
    if summary is None:
        return None
    summary.flagged = True
    summary.flag_reason = reason
    db.commit()
    db.refresh(summary)
    return summary


def unflag_summary(db: Session, summary_id: UUID | str) -> SummarizedJournal | None:
    """Remove a flag from the summary."""

    sid = UUID(str(summary_id))
    summary = db.query(SummarizedJournal).get(sid)
    if summary is None:
        return None
    summary.flagged = False
    summary.flag_reason = None
    db.commit()
    db.refresh(summary)
    return summary

# Footnote: Allows admins to flag and unflag summaries for moderation.
