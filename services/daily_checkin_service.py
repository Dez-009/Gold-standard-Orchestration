from sqlalchemy.orm import Session

# Notes: Import the SQLAlchemy model representing check-ins
from models.daily_checkin import DailyCheckIn


def create_daily_checkin(db: Session, checkin_data: dict) -> DailyCheckIn:
    """Create a new daily check-in and persist it."""
    new_checkin = DailyCheckIn(**checkin_data)
    db.add(new_checkin)
    db.commit()
    db.refresh(new_checkin)
    return new_checkin


def get_daily_checkin_by_id(db: Session, checkin_id: int) -> DailyCheckIn | None:
    """Return a daily check-in by its ID or None if not found."""
    return db.query(DailyCheckIn).filter(DailyCheckIn.id == checkin_id).first()


def get_daily_checkins_by_user(db: Session, user_id: int) -> list[DailyCheckIn]:
    """Return all daily check-ins for a specific user."""
    return db.query(DailyCheckIn).filter(DailyCheckIn.user_id == user_id).all()


def create_checkin(
    db: Session,
    user_id: int,
    mood: str,
    energy_level: int,
    stress_level: int,
    notes: str | None = None,
) -> DailyCheckIn:
    """Create a health check-in from individual parameters."""

    data = {
        "user_id": user_id,
        "mood": mood,
        "energy_level": energy_level,
        "stress_level": stress_level,
        "notes": notes,
    }
    return create_daily_checkin(db, data)


def get_checkins(db: Session, user_id: int) -> list[DailyCheckIn]:
    """Retrieve all health check-ins for the given user."""

    return db.query(DailyCheckIn).filter(DailyCheckIn.user_id == user_id).all()
