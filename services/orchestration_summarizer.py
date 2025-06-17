"""Service for summarizing recent journal entries via the orchestration agent."""

from __future__ import annotations

# Notes: Standard library imports
from datetime import datetime

# Notes: SQLAlchemy session type
from sqlalchemy.orm import Session

# Notes: ORM models used for retrieval and persistence
from models.journal_entry import JournalEntry
from models.summarized_journal import SummarizedJournal

# Notes: Adapter used to call the LLM summarization agent
from services.ai_model_adapter import AIModelAdapter


# Notes: Summarize the latest set of journal entries for a user

def summarize_journal_entries(user_id: int, db: Session) -> str:
    """Return summarized text for the user's recent journal history."""

    # Notes: Query the most recent 10 journal entries for the user
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(10)
        .all()
    )

    # Notes: Build a single text block containing the journal contents
    combined_text = "\n".join(entry.content for entry in entries)

    # Notes: Use the AI model adapter to generate the summary
    adapter = AIModelAdapter("OpenAI")
    summary = adapter.generate(
        [
            {
                "role": "system",
                "content": "Summarize the following journal entries in a short paragraph.",
            },
            {"role": "user", "content": combined_text},
        ],
        temperature=0.5,
    )

    # Notes: Persist the summary record for historical tracking
    record = SummarizedJournal(
        user_id=user_id,
        summary_text=summary,
        created_at=datetime.utcnow(),
        source_entry_ids=str([e.id for e in entries]),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # Notes: Return the summarized text back to the caller
    return summary

# Footnote: This service is used by the orchestration journal summary endpoint.
