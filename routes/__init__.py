from fastapi import APIRouter

from .vida import router as vida_router

router = APIRouter()

router.include_router(vida_router)

