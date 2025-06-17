"""Service functions for retrieving summarized journals."""

from __future__ import annotations

# Notes: Standard library typing helper
from typing import List, Dict, Optional
from uuid import UUID

# Notes: SQLAlchemy session class for database queries
from sqlalchemy.orm import Session

# Notes: ORM model storing journal summary records
from models.summarized_journal import SummarizedJournal


def get_summarized_journals(
    db: Session,
    user_id: int | None,
    limit: int = 100,
    offset: int = 0,
) -> List[Dict]:
    """Return serialized summaries filtered by user and paginated."""

    # Notes: Start building the query from the SummarizedJournal table
    query = db.query(SummarizedJournal)

    # Notes: Apply optional user filter when an id is provided
    if user_id is not None:
        query = query.filter(SummarizedJournal.user_id == user_id)

    # Notes: Apply ordering and pagination for consistent results
    rows = (
        query.order_by(SummarizedJournal.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    # Notes: Convert ORM rows into dictionaries for the API layer
    results: List[Dict] = []
    for row in rows:
        results.append(
            {
                "id": str(row.id),
                "user_id": row.user_id,
                "summary_text": row.summary_text,
                "created_at": row.created_at.isoformat(),
            }
        )

    return results


def get_summary_by_id(db: Session, summary_id: UUID | str) -> Optional[Dict]:
    """Return a single summary record serialized for API use."""

    sid = UUID(str(summary_id)) if not isinstance(summary_id, UUID) else summary_id
    row = db.query(SummarizedJournal).get(sid)
    if row is None:
        return None
    return {
        "id": str(row.id),
        "user_id": row.user_id,
        "summary_text": row.summary_text,
        "created_at": row.created_at.isoformat(),
        "admin_notes": row.admin_notes,
    }


def update_admin_notes(db: Session, summary_id: UUID | str, notes: str) -> Optional[Dict]:
    """Update admin_notes field and return the updated record."""

    sid = UUID(str(summary_id)) if not isinstance(summary_id, UUID) else summary_id
    summary = db.query(SummarizedJournal).get(sid)
    if summary is None:
        return None
    summary.admin_notes = notes
    db.commit()
    db.refresh(summary)
    return {
        "id": str(summary.id),
        "user_id": summary.user_id,
        "summary_text": summary.summary_text,
        "created_at": summary.created_at.isoformat(),
        "admin_notes": summary.admin_notes,
    }

# Footnote: Allows administrators to audit the summarization pipeline.
