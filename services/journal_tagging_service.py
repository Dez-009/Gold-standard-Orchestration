# Notes: Service for extracting goal-related tags from user journal entries
from __future__ import annotations

import json
from sqlalchemy.orm import Session

# Notes: Import the AI abstraction layer and journal ORM model
from services.ai_model_adapter import AIModelAdapter
from models.journal_entry import JournalEntry


# Notes: Analyze all journals for the given user and return a list of tags

def extract_tags_from_journals(db: Session, user_id: int) -> list[str]:
    """Return goal or theme tags extracted from the user's journals."""
    # Notes: Retrieve every journal entry belonging to the user
    entries = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at)
        .all()
    )

    # Notes: Return an empty list when the user has no journal history
    if not entries:
        return []

    # Notes: Combine all journal content into a single text block
    combined_content = "\n".join(entry.content for entry in entries)

    # Notes: Create the AI adapter instance using the default provider
    adapter = AIModelAdapter("OpenAI")

    # Notes: Instruction for the AI to generate JSON list of tags
    system_prompt = (
        "Extract 3-10 short keywords that summarize the user's goals or focus "
        "areas from the provided journal text. Return them as JSON in the form "
        "{\"tags\": [\"tag1\", \"tag2\"]}."
    )

    # Notes: Submit the journal text to the AI model
    response = adapter.generate(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": combined_content},
        ],
        temperature=0.3,
    )

    # Notes: Attempt to parse the AI response as JSON to get the tag list
    try:
        data = json.loads(response)
        tags = data.get("tags", [])
        if isinstance(tags, list):
            return [str(t).strip() for t in tags]
    except Exception:
        pass

    # Notes: Fallback: split a simple comma or newline separated string
    return [t.strip() for t in response.replace("\n", ",").split(",") if t.strip()]
