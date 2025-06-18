"""Service computing flag reason usage stats."""

from __future__ import annotations

from datetime import date, datetime, time
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.summarized_journal import SummarizedJournal


def get_flag_reason_usage(
    db: Session, start_date: Optional[date] = None, end_date: Optional[date] = None
) -> List[Dict[str, int]]:
    """Return counts of flagged summaries grouped by reason."""

    # Notes: Base query grouping by flag_reason column
    query = db.query(
        SummarizedJournal.flag_reason, func.count(SummarizedJournal.id)
    ).filter(SummarizedJournal.flag_reason.isnot(None))

    # Notes: Apply date range filters using flagged_at timestamp
    if start_date:
        start_dt = datetime.combine(start_date, time.min)
        query = query.filter(SummarizedJournal.flagged_at >= start_dt)
    if end_date:
        end_dt = datetime.combine(end_date, time.max)
        query = query.filter(SummarizedJournal.flagged_at <= end_dt)

    rows = query.group_by(SummarizedJournal.flag_reason).all()

    results = [
        {"reason": r[0], "count": r[1]} for r in rows if r[0]
    ]
    # Notes: Sort reasons by count descending for display
    results.sort(key=lambda x: x["count"], reverse=True)
    return results

# Footnote: Used by admin dashboard to visualize flag reason trends.
