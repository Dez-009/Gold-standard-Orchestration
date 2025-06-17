"""Service functions for retrieving summarized journals."""

from __future__ import annotations

# Notes: Standard library typing helper
from typing import List, Dict

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

# Footnote: Allows administrators to audit the summarization pipeline.
