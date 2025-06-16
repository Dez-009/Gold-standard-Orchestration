"""SQLAlchemy models package."""

from .user import User
from .session import Session
from .journal_entry import JournalEntry
from .goal import Goal
from .daily_checkin import DailyCheckIn
from .audit_log import AuditLog
# Include the Task model so it can be accessed via models.Task
from .task import Task
# Notes: Import the Habit model to expose it through the package
from .habit import Habit
# Notes: Include subscription model for billing records
from .subscription import Subscription
# Notes: Include model for mapping users to assigned AI agents
from .agent_assignment import AgentAssignment
# Notes: Import model capturing prior agent interactions
from .agent_interaction_log import AgentInteractionLog
# Notes: Available coaching personalities
from .personality import Personality
# Notes: Import model mapping users to their preferred personalities
from .user_personality import UserPersonality
# Notes: Import notification model for queued messages
from .notification import Notification

__all__ = [
    "User",
    "Session",
    "JournalEntry",
    "Goal",
    "Task",
    "DailyCheckIn",
    "AuditLog",
    "Habit",
    "Subscription",
    "AgentAssignment",
    "AgentInteractionLog",
    "Personality",
    "UserPersonality",
    "Notification",
]

