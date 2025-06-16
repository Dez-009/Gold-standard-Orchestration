from fastapi import APIRouter

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
# Notes: Import router exposing personalities API
from .personality import router as personality_router
# Notes: Import the new action plan router
from .action_plan import router as action_plan_router
# Notes: Import billing router for Stripe webhook endpoints
from .billing import router as billing_router

router = APIRouter()

router.include_router(vida_router)
router.include_router(user_router)
router.include_router(auth_router)
router.include_router(protected_router)
router.include_router(session_router)
router.include_router(journal_router)
router.include_router(notification_router)
router.include_router(goal_router)
router.include_router(task_router)
router.include_router(daily_checkin_router)
router.include_router(checkins_router)
router.include_router(reporting_router)
router.include_router(personality_router)
router.include_router(health_router)
router.include_router(audit_log_router)
# Notes: Register action plan routes with the main router
router.include_router(action_plan_router)
# Notes: Register billing routes so webhooks can be received
router.include_router(billing_router)

