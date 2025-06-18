from fastapi import APIRouter
# Notes: Import settings helper so we can check enabled features
from config import get_settings

from .vida import router as vida_router
from .user import router as user_router
from .auth import router as auth_router
from .protected import router as protected_router
from .session import router as session_router
from .journal import router as journal_router
from .notification import router as notification_router
from .goal import router as goal_router
from .task import router as task_router
from .daily_checkin import router as daily_checkin_router
from .checkins import router as checkins_router
from .reporting import router as reporting_router
from .health import router as health_router
from .audit_log import router as audit_log_router
# Notes: Import router serving audit log list for admins
from .admin_audit import router as admin_audit_router
# Notes: Import router exposing filtered audit log endpoint
from .admin_audit_log import router as admin_audit_log_router
# Notes: Import router exposing personalities API
from .personality import router as personality_router
# Notes: Import router handling agent personality selection
from .agent_personality import router as agent_personality_router
# Notes: Import the new action plan router
from .action_plan import router as action_plan_router
# Notes: Import billing router for Stripe webhook endpoints
from .billing import router as billing_router
from .admin_behavioral_insights import router as admin_behavioral_insight_router
# Notes: Import router exposing aggregated behavioral insights
from .admin_insights import router as admin_insights_router
# Notes: Import router implementing the admin agent query endpoint
from .admin_agent import router as admin_agent_query_router
# Notes: Import router providing admin agent assignment endpoints
from .admin_agent_assignment import router as admin_agent_assignment_router
from .admin_agent_lifecycle import router as admin_agent_lifecycle_router
from .analytics import router as analytics_router
# Notes: Import router serving analytics summaries for admins
from .admin_analytics import router as admin_analytics_router
# Notes: Import router exposing summarized journals for admins
from .admin_summarized_journals import router as admin_summarized_journals_router
from .admin_journals import router as admin_journals_router
# Notes: Import router providing referral endpoints
from .referral import router as referral_router
from .admin_segments import router as admin_segments_router
from .admin_recommendations import router as admin_recommendations_router
# Notes: Import router serving agent state admin endpoints
from .admin_agent_state import router as admin_agent_state_router
from .admin_agent_logs import router as admin_agent_logs_router
# Notes: Import router exposing orchestration performance logs
from .admin_orchestration_logs import router as admin_orchestration_logs_router
# Notes: Import router allowing admins to rerun journal summaries
from .admin_journal_rerun import router as admin_journal_rerun_router
# Notes: Import router handling admin agent personalization endpoints
from .admin_agent_personalization import router as admin_agent_personalization_router
# Notes: Import router providing access to agent scoring logs
from .admin_agent_scores import router as admin_agent_scores_router
from .admin_agent_self_scores import router as admin_agent_self_scores_router
# Notes: Import router exposing device sync history
from .admin_device_sync import router as admin_device_sync_router
from .admin_wearables import router as admin_wearables_router
from .admin_agent_toggles import router as admin_agent_toggles_router
from .admin_agent_access import router as admin_agent_access_router
# Notes: Import router exposing feedback alert logs
# Notes: Import router exposing feedback alert logs
from .admin_feedback_alerts import router as admin_feedback_alerts_router
# Notes: Router exposing user feedback submission and retrieval
from .feedback import router as feedback_router
# Notes: Router allowing admins to review submitted feedback
from .admin_feedback import router as admin_feedback_router
# Notes: Router exposing enabled features for the UI
from .settings import router as settings_router
# Notes: Router allowing admins to toggle features when permitted
from .admin_features import router as admin_features_router
# Notes: Import router for managing persona tokens
from .admin.persona_token_admin import router as admin_persona_token_router
# Notes: Import router providing persona preset CRUD endpoints
from .admin_persona_presets import router as admin_persona_preset_router
from .admin_prompt_versions import router as admin_prompt_versions_router
# Notes: Import router providing user personalization endpoints
from .account_personalization import router as account_personalization_router
# Notes: Import router providing summary PDF exports
from .pdf_export import router as pdf_export_router
# Notes: Import router serving reflection prompt retrieval
from .reflection_prompt import router as reflection_prompt_router
from .conflict_flag import router as conflict_flag_router
from .habit_sync import router as habit_sync_router
from .user_wearable import router as user_wearable_router

router = APIRouter()
# Notes: Load configuration so feature flags can be checked
settings = get_settings()

router.include_router(vida_router)
router.include_router(user_router)
router.include_router(auth_router)
router.include_router(protected_router)
router.include_router(session_router)
# Notes: Journal routes are only mounted when the feature is enabled
if "journal" in settings.ENABLED_FEATURES:
    router.include_router(journal_router)
    router.include_router(reflection_prompt_router)
    router.include_router(conflict_flag_router)
# Notes: Export routes depend on the PDF export feature flag
if "pdf_export" in settings.ENABLED_FEATURES:
    router.include_router(pdf_export_router)
router.include_router(notification_router)
# Notes: Goal management routes controlled by the goals feature flag
if "goals" in settings.ENABLED_FEATURES:
    router.include_router(goal_router)
    router.include_router(task_router)
# Notes: Daily check-in and history routes depend on check-ins feature
if "checkins" in settings.ENABLED_FEATURES:
    router.include_router(daily_checkin_router)
    router.include_router(checkins_router)
router.include_router(reporting_router)
router.include_router(personality_router)
router.include_router(agent_personality_router)
router.include_router(habit_sync_router)
router.include_router(user_wearable_router)
router.include_router(health_router)
router.include_router(audit_log_router)
# Notes: Register action plan routes with the main router
router.include_router(action_plan_router)
# Notes: Register billing routes so webhooks can be received
router.include_router(billing_router)
router.include_router(admin_behavioral_insight_router)
# Notes: Register aggregated behavioral insights route
router.include_router(admin_insights_router)
# Notes: Register the admin agent query route
router.include_router(admin_agent_query_router)
# Notes: Register the admin agent assignment routes
router.include_router(admin_agent_assignment_router)
router.include_router(admin_agent_lifecycle_router)
# Notes: Register summarized journal admin routes
router.include_router(admin_summarized_journals_router)
router.include_router(admin_journals_router)
# Notes: Register the admin rerun route for journal summaries
router.include_router(admin_journal_rerun_router)
# Notes: Register the admin audit log routes
router.include_router(admin_audit_router)
router.include_router(admin_audit_log_router)
router.include_router(analytics_router)
router.include_router(admin_analytics_router)
router.include_router(referral_router)
router.include_router(admin_segments_router)
router.include_router(admin_recommendations_router)
router.include_router(admin_agent_state_router)
router.include_router(admin_agent_logs_router)
router.include_router(admin_orchestration_logs_router)
router.include_router(admin_agent_personalization_router)
router.include_router(admin_agent_scores_router)
router.include_router(admin_agent_self_scores_router)
router.include_router(account_personalization_router)
router.include_router(admin_device_sync_router)
router.include_router(admin_wearables_router)
router.include_router(admin_agent_toggles_router)
router.include_router(admin_agent_access_router)
# Notes: Admin feedback alerts are not feature gated
router.include_router(admin_feedback_alerts_router)
router.include_router(admin_persona_token_router)
router.include_router(admin_persona_preset_router)
router.include_router(admin_prompt_versions_router)
# Notes: Include feedback routes only when the feature is active
if "agent_feedback" in settings.ENABLED_FEATURES:
    router.include_router(feedback_router)
    router.include_router(admin_feedback_router)
# Notes: Provide a read-only endpoint exposing current feature flags
router.include_router(settings_router)
# Notes: Allow runtime feature updates when enabled in the config
if settings.ALLOW_FEATURE_TOGGLE:
    router.include_router(admin_features_router)

# Footnote: Aggregates and registers all route modules.
