from fastapi import FastAPI

from config import settings
from routes import router as api_router

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router)

