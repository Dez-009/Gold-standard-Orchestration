from fastapi import FastAPI, APIRouter

from config import settings
from routes.user import router as user_router
from routes.auth import router as auth_router
from routes.protected import router as protected_router
from routes.session import router as session_router
from routes.notification import router as notification_router
from routes.vida import router as vida_router
from routes.root import router as root_router
from database.base import Base
from database.session import engine

# Automatically create database tables on startup
Base.metadata.create_all(bind=engine)


app = FastAPI(title=settings.project_name, version="0.1.0")

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(session_router)
app.include_router(notification_router)
app.include_router(vida_router)
app.include_router(root_router)

