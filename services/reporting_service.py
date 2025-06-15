# Notes: Import OpenAI client for generating the monthly report
from openai import OpenAI

# Notes: Import the settings helper to obtain the OpenAI API key
from config import get_settings

# Notes: Import SQLAlchemy Session type for database access
from sqlalchemy.orm import Session

# Notes: Import ORM models representing user data
from models.session import Session as SessionModel
from models.journal_entry import JournalEntry
from models.task import Task
from models.habit import Habit

# Notes: Import datetime utilities for calculating the reporting window
from datetime import datetime, timedelta

# Notes: Load application settings and initialize the OpenAI client
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)


# Notes: Generate a monthly coaching progress report for a user

def generate_monthly_report(db: Session, user_id: int) -> str:
    """Return an AI-generated monthly report summarizing user progress."""

    # Notes: Determine the cutoff date one month prior to now
    one_month_ago = datetime.utcnow() - timedelta(days=30)

    # Notes: Retrieve sessions from the past month
    sessions = (
        db.query(SessionModel)
        .filter(SessionModel.user_id == user_id)
        .filter(SessionModel.created_at >= one_month_ago)
        .all()
    )

    # Notes: Retrieve journal entries from the past month
    journals = (
        db.query(JournalEntry)
        .filter(JournalEntry.user_id == user_id)
        .filter(JournalEntry.created_at >= one_month_ago)
        .all()
    )

    # Notes: Retrieve tasks created in the past month
    tasks = (
        db.query(Task)
        .filter(Task.user_id == user_id)
        .filter(Task.created_at >= one_month_ago)
        .all()
    )

    # Notes: Retrieve habits created in the past month
    habits = (
        db.query(Habit)
        .filter(Habit.user_id == user_id)
        .filter(Habit.created_at >= one_month_ago)
        .all()
    )

    # Notes: Build text summaries for each type of record
    session_parts = [s.ai_summary or s.title or "(no summary)" for s in sessions]
    journal_parts = [j.content for j in journals]
    task_parts = [f"{'[x]' if t.is_completed else '[ ]'} {t.description}" for t in tasks]
    habit_parts = [f"{h.habit_name} streak: {h.streak_count}" for h in habits]

    # Notes: Combine all pieces into a single context string
    context_parts = [
        "Sessions:",
        *session_parts,
        "",
        "Journal Entries:",
        *journal_parts,
        "",
        "Tasks:",
        *task_parts,
        "",
        "Habits:",
        *habit_parts,
    ]
    context_summary = "\n".join(context_parts)

    # Notes: Instruction for the AI describing the monthly report format
    system_prompt = (
        "You are Vida, an AI Life Coach. Generate a comprehensive monthly report "
        "summarizing the user\u2019s coaching journey, progress, habits, task "
        "completions, challenges, and personal growth. Highlight major themes."
    )

    # Notes: Call OpenAI to produce the monthly report text
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": context_summary},
        ],
        temperature=0.7,
        max_tokens=2048,
    )

    # Notes: Return the first choice from the AI response
    return response.choices[0].message.content
