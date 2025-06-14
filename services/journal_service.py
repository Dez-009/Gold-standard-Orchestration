from sqlalchemy.orm import Session

from models.journal_entry import JournalEntry


def create_journal_entry(db: Session, entry_data: dict) -> JournalEntry:
    """Create a new journal entry and persist it."""
    new_entry = JournalEntry(**entry_data)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


def get_journal_entry_by_id(db: Session, entry_id: int) -> JournalEntry | None:
    """Return a journal entry by its ID or None if not found."""
    return db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()


def get_journal_entries_by_user(db: Session, user_id: int) -> list[JournalEntry]:
    """Return all journal entries for a specific user."""
    return db.query(JournalEntry).filter(JournalEntry.user_id == user_id).all()
