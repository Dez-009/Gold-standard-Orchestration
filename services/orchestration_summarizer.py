"""Service for summarizing recent journal entries via the orchestration agent."""

from __future__ import annotations

# Notes: Standard library imports
from datetime import datetime

# Notes: SQLAlchemy session type
from sqlalchemy.orm import Session

# Notes: ORM models used for retrieval and persistence
from models.journal_entry import JournalEntry
from models.summarized_journal import SummarizedJournal

# Notes: Import the reflection booster agent and services
from agents.reflection_booster_agent import generate_reflection_prompt
from agents.conflict_resolution_agent import detect_conflict_issues
from services import (
    reflection_prompt_service,
    orchestration_audit_service,
    conflict_resolution_service,
)

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

    # Notes: Generate a follow-up reflection prompt using the booster agent
    try:
        prompt_text = generate_reflection_prompt(
            combined_text,
            mood=None,
            goals=[],
        )
        # Notes: Persist the generated prompt linked to the newest journal entry
        if entries:
            reflection_prompt_service.create_prompt(
                db, user_id, entries[0].id, prompt_text
            )
        # Notes: Log the generation within the orchestration audit trail
        orchestration_audit_service.log_orchestration_request(
            db,
            user_id,
            "reflection_prompt_generation",
            ["ReflectionBoosterAgent"],
            [{"prompt_text": prompt_text}],
        )
    except Exception:  # pragma: no cover - best effort logging
        pass

    # Notes: Run the conflict detection agent and persist any flags
    try:
        flags = detect_conflict_issues(combined_text)
        if flags and entries:
            conflict_resolution_service.save_conflict_flags(
                db, user_id, entries[0].id, flags
            )
            # Notes: Log the conflict results for auditing
            orchestration_audit_service.log_orchestration_request(
                db,
                user_id,
                "conflict_detection",
                ["ConflictResolutionAgent"],
                [
                    {
                        "type": str(flags[0].conflict_type),
                        "excerpt": flags[0].summary_excerpt,
                    }
                ],
            )
    except Exception:  # pragma: no cover - best effort logging
        pass

    # Notes: Return the summarized text back to the caller
    return summary

# Footnote: This service is used by the orchestration journal summary endpoint.
