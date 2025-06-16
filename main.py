from fastapi import FastAPI, APIRouter

# Import middleware configuration utilities
from middleware import init_middlewares

from config import settings
from routes.user import router as user_router
from routes.auth import router as auth_router
from routes.protected import router as protected_router
from routes.session import router as session_router
from routes.journal import router as journal_router
from routes.notification import router as notification_router
from routes.goal import router as goal_router
from routes.daily_checkin import router as daily_checkin_router
from routes.reporting import router as reporting_router
# Notes: Import router handling task operations
from routes.task import router as task_router
# Notes: Import router for AI coach endpoints
from routes.ai_coach import router as ai_coach_router
# Notes: Import router exposing account-related endpoints
from routes.account import router as account_router
from routes.vida import router as vida_router
from routes.root import router as root_router
from routes.health import router as health_router
# Router to expose audit log endpoints
from routes.audit_log import router as audit_log_router
# Notes: Import router responsible for generating action plans
from routes.action_plan import router as action_plan_router
# Notes: Import billing webhook router
from routes.billing import router as billing_router
from routes.admin.system_tasks import router as admin_system_router
from routes.admin.billing_admin import router as admin_billing_router
from routes.admin.webhooks import router as admin_webhook_router

from routes.admin.subscription_history import (
    router as admin_subscription_history_router,
)
from database.base import Base
from database.session import engine

# Automatically create database tables on startup
# This ensures the database schema is ready when the application starts
Base.metadata.create_all(bind=engine)


# Initialize the FastAPI application with project metadata
app = FastAPI(title=settings.project_name, version="0.1.0")

# Register middleware components on the app instance
init_middlewares(app)

# Register routers for the various application features
app.include_router(user_router)
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(session_router)
app.include_router(journal_router)
app.include_router(notification_router)
app.include_router(goal_router)
app.include_router(task_router)
app.include_router(daily_checkin_router)
app.include_router(account_router)
app.include_router(reporting_router)
app.include_router(vida_router)
# Register billing routes for webhook handling
app.include_router(billing_router)
# Register AI coach router to expose AI-powered coaching endpoints
app.include_router(ai_coach_router)
# Notes: Include routes that generate action plans for user goals
app.include_router(action_plan_router)
app.include_router(root_router)
app.include_router(health_router)
# Register routes for auditing user actions
app.include_router(audit_log_router)
app.include_router(admin_billing_router)
app.include_router(admin_system_router)
app.include_router(admin_webhook_router)
app.include_router(admin_subscription_history_router)

