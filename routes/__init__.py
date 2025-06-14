from fastapi import APIRouter

from .vida import router as vida_router
from .user import router as user_router

router = APIRouter()

router.include_router(vida_router)
router.include_router(user_router)

