"""Service functions for retrieving journal entries for admins."""

from __future__ import annotations

from typing import List, Dict, Optional

from sqlalchemy.orm import Session

from models.journal_entry import JournalEntry


# Notes: Query journals optionally filtered by user and AI flag

def get_journals(
    db: Session,
    user_id: int | None,
    ai_only: bool | None = None,
    limit: int = 100,
    offset: int = 0,
) -> List[Dict]:
    """Return serialized journal entries matching the filters."""

    query = db.query(JournalEntry)
    if user_id is not None:
        query = query.filter(JournalEntry.user_id == user_id)
    if ai_only is True:
        query = query.filter(JournalEntry.ai_generated.is_(True))
    elif ai_only is False:
        query = query.filter(JournalEntry.ai_generated.is_(False))

    rows = (
        query.order_by(JournalEntry.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    results: List[Dict] = []
    for row in rows:
        results.append(
            {
                "id": row.id,
                "user_id": row.user_id,
                "title": row.title,
                "content": row.content,
                "created_at": row.created_at.isoformat(),
                "ai_generated": row.ai_generated,
            }
        )

    return results

