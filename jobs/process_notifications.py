# Notes: Entry point script to process pending notifications

# Notes: Import database session factory and service function
from database.session import SessionLocal
from services.notification_service import process_pending_notifications


# Notes: Run the processing function within its own database session

def run() -> None:
    """Execute the pending notification job."""
    db = SessionLocal()
    try:
        process_pending_notifications(db)
    finally:
        db.close()


if __name__ == "__main__":
    run()
