"""Service to re-run the journal summarization agent for an existing summary."""

from __future__ import annotations

# Notes: Standard library imports for typing and timestamp
from datetime import datetime
from uuid import UUID

# Notes: SQLAlchemy session class used for database operations
from sqlalchemy.orm import Session

# Notes: ORM models referenced during rerun
from models.summarized_journal import SummarizedJournal

# Notes: Summarization utility reused for generating fresh output
from services.orchestration_summarizer import summarize_journal_entries

# Notes: Performance logging helper for audit trail
from services.orchestration_log_service import log_agent_run


def rerun_summary(db: Session, summary_id: UUID) -> SummarizedJournal:
    """Re-execute the summarization agent and replace stored output."""

    # Notes: Retrieve the existing summary record and validate it exists
    summary = db.query(SummarizedJournal).get(summary_id)
    if summary is None:
        raise ValueError("Summary not found")

    # Notes: Clear any cached data related to the summarizer
    summarize_journal_entries.cache_clear() if hasattr(summarize_journal_entries, "cache_clear") else None  # type: ignore[attr-defined]

    # Notes: Invoke the orchestration pipeline again using the same user context
    new_text = summarize_journal_entries(summary.user_id, db)

    # Notes: Update the existing summary record with the new text
    summary.summary_text = new_text
    summary.created_at = datetime.utcnow()
    db.commit()
    db.refresh(summary)

    # Notes: Log the rerun event for auditing purposes
    log_agent_run(
        db,
        "JournalSummarizationAgent",
        summary.user_id,
        {
            "execution_time_ms": 0,
            "input_tokens": 0,
            "output_tokens": 0,
            "status": "rerun",
            "fallback_triggered": False,
            "timeout_occurred": False,
            "retries": 0,
            "error_message": None,
            "override_triggered": False,
            "override_reason": None,
        },
    )

    return summary

# Footnote: Used by admin rerun endpoint to refresh a summary's text.
