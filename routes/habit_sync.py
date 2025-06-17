"""Routes for syncing and retrieving habit data."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.utils import get_db
from models.habit_sync import HabitDataSource
from services.habit_sync_service import sync_habits, get_recent_habits, summarize_habit_impact
from models.user import User

router = APIRouter(prefix="/habit-sync", tags=["habit-sync"])


@router.post("/sync")
def create_sync(
    source: HabitDataSource = HabitDataSource.FITBIT,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Trigger a habit sync for the authenticated user."""

    row = sync_habits(db, current_user.id, source)
    return {
        "id": str(row.id),
        "steps": row.steps,
        "sleep_hours": row.sleep_hours,
        "active_minutes": row.active_minutes,
        "synced_at": row.synced_at.isoformat(),
    }


@router.get("/recent")
def read_recent(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[dict]:
    """Return recent habit metrics for the user."""

    rows = get_recent_habits(db, current_user.id, days)
    return [
        {
            "id": str(r.id),
            "steps": r.steps,
            "sleep_hours": r.sleep_hours,
            "active_minutes": r.active_minutes,
            "synced_at": r.synced_at.isoformat(),
        }
        for r in rows
    ]


@router.get("/summary")
def habit_summary(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return averages describing recent habit impact."""

    return summarize_habit_impact(db, current_user.id, days)

# Footnote: Exposes simple endpoints for syncing and reporting habits.
