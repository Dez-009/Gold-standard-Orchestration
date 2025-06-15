from fastapi import APIRouter

from config import VERSION

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/ping")
async def ping():
    """Simple health check endpoint."""
    return {"status": "ok"}


@router.get("/version")
async def get_version():
    """Return the running application version."""
    return {"version": VERSION}
