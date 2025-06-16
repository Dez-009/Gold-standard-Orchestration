# Notes: Import OpenAI client and application settings helper
from openai import OpenAI
from config import get_settings

# Notes: Import SQLAlchemy Session for database interaction
from sqlalchemy.orm import Session

# Notes: Import the ORM model for journal entries
from models.journal_entry import JournalEntry

# Notes: Initialize settings and OpenAI client using the API key
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


# Notes: Summarize the latest journal entries for a given user

def summarize_user_journals(user_id: int, db: Session) -> str:
    """Return an AI-generated summary of the user's recent journals."""
    # Notes: Query the ten most recent journal entries for the user
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(10)
        .all()
    )

    # Notes: Build a text block enumerating the journal contents
    context_lines: list[str] = []
    for idx, entry in enumerate(journals, start=1):
        context_lines.append(f'Journal Entry {idx}: "{entry.content}"')
    journal_entries_block = "\n".join(context_lines)

    # Notes: Send the collected entries to the OpenAI chat completion API
    response = client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a coaching assistant summarizing journal entries.",
            },
            {"role": "user", "content": "Summarize the following:\n" + journal_entries_block},
        ],
    )

    # Notes: Return the summary text from the first choice in the response
    return response.choices[0].message.content
