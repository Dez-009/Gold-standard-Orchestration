from sqlalchemy.orm import Session

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
