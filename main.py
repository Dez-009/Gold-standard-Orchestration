from fastapi import FastAPI, APIRouter

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
from routes.vida import router as vida_router
from routes.root import router as root_router
from routes.health import router as health_router
# Router to expose audit log endpoints
from routes.audit_log import router as audit_log_router
from database.base import Base
from database.session import engine

# Automatically create database tables on startup
Base.metadata.create_all(bind=engine)


app = FastAPI(title=settings.project_name, version="0.1.0")

# Initialize middlewares
init_middlewares(app)

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(session_router)
app.include_router(journal_router)
app.include_router(notification_router)
app.include_router(goal_router)
app.include_router(daily_checkin_router)
app.include_router(reporting_router)
app.include_router(vida_router)
app.include_router(root_router)
app.include_router(health_router)
# Register routes for auditing user actions
app.include_router(audit_log_router)

