from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from database.utils import get_db
from models import User, JournalEntry, Goal, DailyCheckIn

router = APIRouter(prefix="/reporting", tags=["reporting"])


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)) -> dict:
    """Return counts for key resources."""
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_journals = db.query(func.count(JournalEntry.id)).scalar() or 0
    total_goals = db.query(func.count(Goal.id)).scalar() or 0
    total_checkins = db.query(func.count(DailyCheckIn.id)).scalar() or 0

    return {
        "total_users": total_users,
        "total_journals": total_journals,
        "total_goals": total_goals,
        "total_checkins": total_checkins,
    }
