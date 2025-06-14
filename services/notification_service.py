"""Notification service for Vida Coach.

This module contains helper functions to send various
notifications to users. The current implementation simply logs
messages to stdout, but this can later be replaced with email,
SMS or push notification integrations.
"""

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
