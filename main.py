from fastapi import FastAPI

from config import settings
from routes import router as api_router
from routes.root import router as root_router
from database.base import Base
from database.session import engine

# Automatically create database tables on startup
Base.metadata.create_all(bind=engine)


app = FastAPI(title=settings.project_name, version="0.1.0")

app.include_router(api_router)
app.include_router(root_router)

