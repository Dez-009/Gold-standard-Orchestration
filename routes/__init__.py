from fastapi import APIRouter

from .vida import router as vida_router
from .user import router as user_router
from .auth import router as auth_router
from .protected import router as protected_router
from .session import router as session_router

router = APIRouter()

router.include_router(vida_router)
router.include_router(user_router)
router.include_router(auth_router)
router.include_router(protected_router)
router.include_router(session_router)

