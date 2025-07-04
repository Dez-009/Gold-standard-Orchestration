"""Query helpers for summarized journal records."""

from __future__ import annotations

from datetime import datetime
from typing import List, Dict, Any, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from models.summarized_journal import SummarizedJournal


def list_flagged_summaries(
    db: Session, filters: Dict[str, Any] | None = None, limit: int = 100, offset: int = 0
) -> List[Dict]:
    """Return flagged summaries ordered by most recently flagged."""

    filters = filters or {}
    query = db.query(SummarizedJournal).filter(SummarizedJournal.flagged.is_(True))

    user_id = filters.get("user_id")
    if user_id is not None:
        query = query.filter(SummarizedJournal.user_id == int(user_id))

    date_from = filters.get("date_from")
    if isinstance(date_from, datetime):
        query = query.filter(SummarizedJournal.flagged_at >= date_from)

    date_to = filters.get("date_to")
    if isinstance(date_to, datetime):
        query = query.filter(SummarizedJournal.flagged_at <= date_to)

    rows = (
        query.order_by(SummarizedJournal.flagged_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    return [
        {
            "id": str(r.id),
            "user_id": r.user_id,
            "summary_text": r.summary_text,
            "created_at": r.created_at.isoformat(),
            "flagged_at": r.flagged_at.isoformat() if r.flagged_at else None,
            "flag_reason": r.flag_reason,
        }
        for r in rows
    ]


def flag_summary(db: Session, summary_id: UUID | str, reason: str) -> Optional[Dict]:
    """Mark a summary as flagged and persist the reason."""

    sid = UUID(str(summary_id)) if not isinstance(summary_id, UUID) else summary_id
    # Notes: session.get avoids deprecated Query.get usage
    summary = db.get(SummarizedJournal, sid)
    if summary is None:
        return None
    summary.flagged = True
    summary.flag_reason = reason
    summary.flagged_at = datetime.utcnow()
    db.commit()
    db.refresh(summary)
    return {
        "id": str(summary.id),
        "user_id": summary.user_id,
        "flagged": summary.flagged,
        "flag_reason": summary.flag_reason,
        "flagged_at": summary.flagged_at.isoformat() if summary.flagged_at else None,
    }


def unflag_summary(db: Session, summary_id: UUID | str) -> Optional[Dict]:
    """Clear the flag status for the given summary."""

    sid = UUID(str(summary_id)) if not isinstance(summary_id, UUID) else summary_id
    # Notes: session.get for retrieval to silence SQLAlchemy warnings
    summary = db.get(SummarizedJournal, sid)
    if summary is None:
        return None
    summary.flagged = False
    summary.flag_reason = None
    summary.flagged_at = None
    db.commit()
    db.refresh(summary)
    return {
        "id": str(summary.id),
        "user_id": summary.user_id,
        "flagged": summary.flagged,
        "flag_reason": summary.flag_reason,
        "flagged_at": None,
    }

