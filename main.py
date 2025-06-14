from fastapi import FastAPI

from config import settings
from routes import router as api_router

app = FastAPI(title=settings.project_name)

app.include_router(api_router)

