"""Database helpers for storing and summarizing habit sync data."""

# Notes: datetime used for date range calculations
from datetime import datetime, timedelta
from typing import List

# Notes: SQLAlchemy session class for type hints
from sqlalchemy.orm import Session

from models.habit_sync import HabitSyncData, HabitDataSource


# Notes: Persist a HabitSyncData row

def save_habit_data(row: HabitSyncData, db: Session | None = None) -> HabitSyncData:
    """Add the record to the provided session or default session."""

    if db is None:
        from database.utils import get_db

        # Notes: When no session provided, open a new one for convenience
        db = next(get_db())
        created_here = True
    else:
        created_here = False

    db.add(row)
    db.commit()
    db.refresh(row)
    if created_here:
        db.close()
    return row


# Notes: Trigger the agent and store metrics

def sync_habits(db: Session, user_id: int, source: HabitDataSource = HabitDataSource.FITBIT) -> HabitSyncData:
    """Generate and store today's metrics via the agent."""

    from agents.habit_sync_agent import sync_and_store_habit_data

    sync_and_store_habit_data(user_id, source, db)
    # Notes: Return the most recent entry for confirmation
    return (
        db.query(HabitSyncData)
        .filter(HabitSyncData.user_id == user_id)
        .order_by(HabitSyncData.synced_at.desc())
        .first()
    )


# Notes: Retrieve recent metrics for the user

def get_recent_habits(db: Session, user_id: int, days: int = 7) -> List[HabitSyncData]:
    """Return habit metrics for the last N days."""

    cutoff = datetime.utcnow() - timedelta(days=days)
    return (
        db.query(HabitSyncData)
        .filter(HabitSyncData.user_id == user_id, HabitSyncData.synced_at >= cutoff)
        .order_by(HabitSyncData.synced_at.desc())
        .all()
    )


# Notes: Summarize averages across recent data

def summarize_habit_impact(db: Session, user_id: int, days: int = 7) -> dict:
    """Return average steps, sleep, and activity over the window."""

    rows = get_recent_habits(db, user_id, days)
    if not rows:
        return {"steps": 0, "sleep_hours": 0.0, "active_minutes": 0}
    steps = sum(r.steps for r in rows) / len(rows)
    sleep = sum(r.sleep_hours for r in rows) / len(rows)
    active = sum(r.active_minutes for r in rows) / len(rows)
    return {
        "steps": int(steps),
        "sleep_hours": round(sleep, 1),
        "active_minutes": int(active),
    }

# Footnote: Service provides a lightweight analytics layer for habits.
