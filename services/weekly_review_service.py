# Notes: Import OpenAI client and application settings
from openai import OpenAI
from config import get_settings

# Notes: Import Session type for database operations
from sqlalchemy.orm import Session

# Notes: Import ORM models used in the weekly review
from models.session import Session as SessionModel
from models.journal_entry import JournalEntry
from models.task import Task

# Notes: Import time utilities for filtering the last week of data
from datetime import datetime, timedelta

# Notes: Initialize settings and OpenAI client once at module load
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


# Notes: Generate a weekly progress review for the given user

def generate_weekly_review(db: Session, user_id: int) -> str:
    """Return an AI-generated summary of the user's past week."""

    # Notes: Determine the timestamp one week prior to now
    one_week_ago = datetime.utcnow() - timedelta(days=7)

    # Notes: Retrieve sessions created within the last week
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id)
        .filter(SessionModel.created_at >= one_week_ago)
        .all()
    )

    # Notes: Retrieve journal entries from the same period
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .filter(JournalEntry.created_at >= one_week_ago)
        .all()
    )

    # Notes: Retrieve tasks created within the last week
    tasks = (
        db.query(Task)
        .filter(Task.user_id == user_id)
        .filter(Task.created_at >= one_week_ago)
        .all()
    )

    # Notes: Build a textual summary of the fetched records
    session_summaries = [s.ai_summary or s.title or "(no summary)" for s in sessions]
    journal_summaries = [j.content for j in journals]
    task_summaries = [f"{'[x]' if t.is_completed else '[ ]'} {t.description}" for t in tasks]

    context_parts = [
        "Recent Sessions:",
        *session_summaries,
        "",
        "Journal Entries:",
        *journal_summaries,
        "",
        "Tasks:",
        *task_summaries,
    ]
    context_summary = "\n".join(context_parts)

    # Notes: Describe to the AI how to craft the weekly review
    system_prompt = (
        "You are Vida, an AI Life Coach. Summarize the user's weekly progress, "
        "based on their coaching sessions, journals, and tasks. Highlight "
        "accomplishments, identify patterns, and provide light encouragement."
    )

    # Notes: Send the context to OpenAI and retrieve the generated summary
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": context_summary},
        ],
        temperature=0.7,
        max_tokens=1024,
    )

    # Notes: Return the text portion of the first response choice
    return response.choices[0].message.content
