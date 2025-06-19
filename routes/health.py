from fastapi import APIRouter

from config import VERSION

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/ping")
async def ping():
    """Simple health check endpoint."""
    # Return a basic response to indicate the service is running
    return {"status": "ok"}


@router.get("/version")
async def get_version():
    """Return the running application version."""
    # Expose the application version from configuration
    return {"version": VERSION}
