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
# Notes: Import override mapping allowing admins to force agent selection
from .agent_assignment_override import AgentAssignmentOverride
# Notes: Import notification model for queued messages
from .notification import Notification
from .system_metrics import SystemMetric
from .behavioral_insights import BehavioralInsight
from .orchestration_log import OrchestrationLog, OrchestrationPerformanceLog
from .agent_lifecycle_log import AgentLifecycleLog
from .journal_summary import JournalSummary
from .journal_trends import JournalTrend
from .summarized_journal import SummarizedJournal
from .analytics_event import AnalyticsEvent
from .user_session import UserSession
from .churn_risk import ChurnRisk, RiskCategory
from .churn_score import ChurnScore
# Notes: Import model tracking the latest state for each agent
from .agent_state import AgentState
# Notes: Import model for queued agent failures
from .agent_failure_queue import AgentFailureQueue
# Notes: Import model capturing metrics for each agent execution
from .agent_execution_log import AgentExecutionLog
# Notes: Import model storing per-user agent personalization
from .agent_personalization import AgentPersonalization
# Notes: Import model capturing scoring metrics for agent outputs
from .agent_score import AgentScore
from .agent_self_score import AgentSelfScore
# Notes: Import model capturing user reactions to agent summaries
from .agent_feedback import AgentFeedback
# Notes: Import model storing low rating alerts for admin review
from .agent_feedback_alert import AgentFeedbackAlert
# Notes: Import model storing admin toggles per agent
from .agent_settings import AgentToggle
# Notes: Include the user feedback model for collecting suggestions
from .user_feedback import UserFeedback, FeedbackType
# Notes: Import the referral model for viral sharing features
from .referral import Referral
from .user_segment import UserSegment
# Notes: Import model capturing wearable device sync events
from .device_sync import DeviceSyncLog
# Notes: Import model storing follow-up reflection prompts
from .habit_sync import HabitSyncData, HabitDataSource
from .wearable_sync import WearableSyncData, WearableDataType
from .wearable_sync_log import WearableSyncLog, SyncStatus
from .reflection_prompt import ReflectionPrompt
from .conflict_flag import ConflictFlag, ConflictType
# Notes: Import model storing persona token assignments
from .persona_token import PersonaToken
# Notes: Import model defining persona presets
from .persona_preset import PersonaPreset
from .prompt_version import PromptVersion

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
    "AgentAssignmentOverride",
    "Personality",
    "UserPersonality",
    "Notification",
    "SystemMetric",
    "BehavioralInsight",
    "OrchestrationLog",
    "OrchestrationPerformanceLog",
    "AgentLifecycleLog",
    "JournalSummary",
    "JournalTrend",
    "SummarizedJournal",
    "AnalyticsEvent",
    "UserSession",
    "ChurnRisk",
    "ChurnScore",
    "RiskCategory",
    "UserFeedback",
    "FeedbackType",
    "Referral",
    "UserSegment",
    "AgentState",
    "AgentFailureQueue",
    "AgentExecutionLog",
    "AgentPersonalization",
    "AgentScore",
    "AgentSelfScore",
    "AgentFeedback",
    "AgentFeedbackAlert",
    "AgentToggle",
    "DeviceSyncLog",
    "HabitSyncData",
    "HabitDataSource",
    "WearableSyncData",
    "WearableDataType",
    "WearableSyncLog",
    "SyncStatus",
    "ReflectionPrompt",
    "ConflictFlag",
    "ConflictType",
    "PersonaToken",
    "PersonaPreset",
    "PromptVersion",
]

# Footnote: Model package exposes all ORM models for import.
