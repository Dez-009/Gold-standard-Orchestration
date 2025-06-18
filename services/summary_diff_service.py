from __future__ import annotations

"""Utility for generating markdown diffs between journal summaries."""

from difflib import HtmlDiff
from uuid import UUID
from typing import Iterable

from sqlalchemy.orm import Session
from database.session import SessionLocal
from models.summarized_journal import SummarizedJournal
from models.journal_entry import JournalEntry


def _load_text(db: Session, entry_ids: Iterable[int]) -> str:
    """Return concatenated journal entry text for given ids."""
    entries = (
        db.query(JournalEntry).filter(JournalEntry.id.in_(list(entry_ids))).order_by(JournalEntry.id).all()
    )
    return "\n".join(e.content for e in entries)


def generate_summary_diff(summary_id: UUID | str) -> str:
    """Return a side-by-side HTML diff of the latest vs previous summary."""

    sid = UUID(str(summary_id))
    db: Session = SessionLocal()
    try:
        summary = db.query(SummarizedJournal).get(sid)
        if summary is None:
            raise ValueError("Summary not found")

        # Collect previous summary if it exists
        prev = (
            db.query(SummarizedJournal)
            .filter(
                SummarizedJournal.user_id == summary.user_id,
                SummarizedJournal.created_at < summary.created_at,
            )
            .order_by(SummarizedJournal.created_at.desc())
            .first()
        )
        prev_text = prev.summary_text if prev else ""
        latest_text = summary.summary_text

        # Build side-by-side diff highlighting insertions and deletions
        diff = HtmlDiff(wrapcolumn=80).make_table(
            prev_text.splitlines(),
            latest_text.splitlines(),
            fromdesc="Previous",
            todesc="Latest",
            context=True,
            numlines=2,
        )
        return diff
    finally:
        db.close()

