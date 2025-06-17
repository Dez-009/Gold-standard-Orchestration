"""Service for constructing conversation memory context."""

# Notes: Import typing for DB interactions
from sqlalchemy.orm import Session

# Notes: Import ORM models that provide memory sources
from models.journal_entry import JournalEntry
from models.goal import Goal
from models.session import Session as SessionModel
from models.task import Task

# Notes: Limits for how much history to include
RECENT_JOURNAL_LIMIT = 5
RECENT_SESSION_LIMIT = 3
MAX_MEMORY_TOKENS = 300


# Notes: Simple helper to count tokens approximately using whitespace

def _approx_token_count(text: str) -> int:
    """Return the number of whitespace separated tokens."""
    return len(text.split())


# Notes: Helper to truncate a text string to a token limit

def _truncate_to_tokens(text: str, max_tokens: int) -> str:
    """Return text trimmed to the last max_tokens tokens when it is too long."""
    words = text.split()
    if len(words) <= max_tokens:
        return text
    return " ".join(words[-max_tokens:])


# Notes: Build a combined memory block for prompt injection

def build_memory_context(
    db: Session,
    user_id: int,
    agent_list: list[str] | None,
    current_prompt: str,
) -> str:
    """Return summarized memory context for the user."""

    # Notes: Fetch the most recent journal entries for context
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .order_by(JournalEntry.created_at.desc())
        .limit(RECENT_JOURNAL_LIMIT)
        .all()
    )
    journal_snippets = [j.content for j in journals]

    # Notes: Gather all goals that are not yet completed
    goals = (
        db.query(Goal)
        .filter(Goal.user_id == user_id, Goal.is_completed.is_(False))
        .all()
    )
    goal_summaries = [g.title for g in goals]

    # Notes: Retrieve the latest session summaries for continuity
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id)
        .order_by(SessionModel.created_at.desc())
        .limit(RECENT_SESSION_LIMIT)
        .all()
    )
    session_notes: list[str] = []
    for s in sessions:
        if s.ai_summary:
            session_notes.append(s.ai_summary)
        elif s.conversation_history:
            session_notes.append(s.conversation_history)

    # Notes: Include any active tasks that are not completed
    tasks = (
        db.query(Task)
        .filter(Task.user_id == user_id, Task.is_completed.is_(False))
        .all()
    )
    task_lines = [t.description for t in tasks]

    # Notes: Compose the memory block referencing each source
    parts: list[str] = []
    if session_notes:
        parts.append("Previous Sessions:")
        parts.extend(session_notes)
    if journal_snippets:
        if parts:
            parts.append("")
        parts.append("Journal Entries:")
        parts.extend(journal_snippets)
    if goal_summaries:
        if parts:
            parts.append("")
        parts.append("Active Goals:")
        parts.extend(goal_summaries)
    if task_lines:
        if parts:
            parts.append("")
        parts.append("Active Tasks:")
        parts.extend(task_lines)

    memory_context = "\n".join(parts)

    # Notes: Enforce a token limit to keep prompts manageable
    if _approx_token_count(memory_context) > MAX_MEMORY_TOKENS:
        memory_context = _truncate_to_tokens(memory_context, MAX_MEMORY_TOKENS)

    return memory_context

# Footnote: Aggregates longitudinal user context to provide memory-enhanced prompt building.
