"""Notification service for Vida Coach.

This module contains helper functions to send various
notifications to users. The current implementation simply logs
messages to stdout, but this can later be replaced with email,
SMS or push notification integrations.
"""

# Import datetime for potential timestamp handling in future implementations
import datetime

# Notes: Import SQLAlchemy session type for database operations
from sqlalchemy.orm import Session

# Notes: Import queued notification model and delivery router
from models.notification import Notification
from services.notifications.delivery_router import deliver_notification

from models.user import User


def send_daily_motivation(user: User) -> None:
    """Send a daily motivational message to the user."""
    print(f"Sending daily motivation to {user.email}")


def send_weekly_checkin(user: User) -> None:
    """Send the weekly check-in notification to the user."""
    print(f"Sending weekly check-in to {user.email}")


def send_action_reminder(user: User, reminder_text: str) -> None:
    """Send an action reminder with the provided text."""
    print(f"Sending action reminder to {user.email}: {reminder_text}")


# ---------------------------------------------------------------------------
# The following class groups additional notification behaviors. For now these
# methods simply log messages, but they will eventually integrate with real
# delivery mechanisms such as email or push services.
# ---------------------------------------------------------------------------

class NotificationService:
    """Utility class providing higher-level notification helpers."""

    def send_daily_reminder(self, user: User) -> None:
        """Simulate sending daily task reminders to a user."""
        print(f"Daily reminder sent to {user.email}")

    def send_goal_nudge(self, user: User) -> None:
        """Simulate nudging the user about pending goals."""
        print(f"Goal nudge sent to {user.email}")

    def send_weekly_review(self, user: User) -> None:
        """Simulate prompting the user for a weekly review."""
        print(f"Weekly review reminder sent to {user.email}")


# Notes: Process and deliver any pending notifications in the database
def process_pending_notifications(db: Session) -> None:
    """Fetch pending notifications and deliver them."""
    # Notes: Query notifications that are scheduled and not yet sent
    pending = (
        db.query(Notification)
        .filter(Notification.status == "pending")
        .filter(Notification.scheduled_at <= datetime.datetime.utcnow())
        .all()
    )

    # Notes: Deliver each notification and update its status
    for notification in pending:
        deliver_notification(notification)
        notification.status = "sent"
        notification.delivered_at = datetime.datetime.utcnow()

    # Notes: Persist status updates back to the database
    db.commit()
