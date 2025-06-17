"""Agent for synchronizing and evaluating daily habit data."""

# Notes: Standard imports for generating random mock data
import random
from datetime import datetime, timedelta

# Notes: Import the new ORM model and enum
from models.habit_sync import HabitSyncData, HabitDataSource

# Notes: Service layer to persist synced data
from services.habit_sync_service import save_habit_data
from sqlalchemy.orm import Session


# Notes: Generate synthetic metrics for a user or provider

def _mock_pull_metrics(source: HabitDataSource) -> dict:
    """Return fake metrics mimicking data from wearables."""

    # Notes: Use deterministic seed for repeatable tests
    random.seed(42)
    return {
        "steps": random.randint(2000, 10000),
        "sleep_hours": round(random.uniform(5.0, 8.0), 1),
        "active_minutes": random.randint(10, 60),
    }


# Notes: Evaluate the metrics to produce simple recommendations

def _analyze_metrics(metrics: dict) -> str:
    """Return a short recommendation string based on thresholds."""

    notes: list[str] = []
    if metrics["steps"] < 5000:
        notes.append("Consider a walk to increase steps")
    if metrics["sleep_hours"] < 6:
        notes.append("Aim for at least 7 hours of sleep")
    if metrics["active_minutes"] < 30:
        notes.append("Try some light exercise today")
    if not notes:
        return "Keep up the good work!"
    return " ".join(notes)


# Notes: Primary entry that other services will call

def sync_and_store_habit_data(
    user_id: int,
    source: HabitDataSource = HabitDataSource.FITBIT,
    db: Session | None = None,
) -> str:
    """Persist metrics and return coaching advice."""

    metrics = _mock_pull_metrics(source)

    # Notes: Build and save ORM row
    row = HabitSyncData(
        user_id=user_id,
        source=source,
        steps=metrics["steps"],
        sleep_hours=metrics["sleep_hours"],
        active_minutes=metrics["active_minutes"],
        synced_at=datetime.utcnow(),
    )
    save_habit_data(row, db)

    # Notes: Analyze the data for quick suggestions
    return _analyze_metrics(metrics)

# Footnote: Intended to run daily or when new wearable data is available.
