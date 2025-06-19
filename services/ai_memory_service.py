# Notes: Import SQLAlchemy Session for database operations
from sqlalchemy.orm import Session

# Notes: Import database models for sessions and journal entries
from models.session import Session as SessionModel
from models.journal_entry import JournalEntry


# Notes: Gather recent session summaries and journal entries for AI context

def get_user_context_memory(db: Session, user_id: int) -> str:
    """Return a combined string of recent session summaries and journal contents."""
    # Notes: Query the last 5 sessions for the user ordered by creation time
    recent_sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id)
        .order_by(SessionModel.created_at.desc())
        .limit(5)
        .all()
    )

    # Notes: Query the last 5 journal entries for the user ordered by creation time
    recent_journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(5)
        .all()
    )

    # Notes: Collect the text from session summaries and journal entry content
    context_parts: list[str] = []
    for session in recent_sessions:
        if session.ai_summary:
            context_parts.append(session.ai_summary)
    for entry in recent_journals:
        context_parts.append(entry.content)

    # Notes: Join all pieces with line breaks to form the context memory string
    return "\n".join(context_parts)
