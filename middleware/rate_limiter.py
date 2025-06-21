from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address as slowapi_get_remote_address
from utils.logger import get_logger
from config import get_settings
import os


def get_remote_address(request: Request) -> str:
    """Safely extract the client host for rate limiting."""
    client = request.client
    if client and client.host:
        return client.host
    return "127.0.0.1"


limiter: Limiter | None = None


logger = get_logger()


def _rate_limit_exceeded_handler(
    request: Request, exc: RateLimitExceeded
) -> JSONResponse:
    """Return JSON response when rate limit is exceeded."""
    logger.warning("Rate limit exceeded for request: %s", request.url)
    return JSONResponse(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        content={"detail": "Too Many Requests"},
    )


def init_rate_limiter(app: FastAPI, default_limit: str | None = None) -> None:
    """Attach the rate limiter middleware to the FastAPI app."""
    global limiter
    # Workaround: Skip rate limiter if running tests
    if os.environ.get("TESTING") == "true":
        logger.info("Skipping rate limiter middleware during tests.")
        return
    
    try:
        if limiter is None:
            settings = get_settings()
            limiter = Limiter(
                key_func=get_remote_address,
                default_limits=[settings.RATE_LIMIT],
            )
            # Ensure third-party utilities use the safe key function
            slowapi_get_remote_address.__module__  # keep import for patch
            import slowapi.util as slowapi_util
            slowapi_util.get_remote_address = get_remote_address
            if default_limit:
                limiter.default_limits = [default_limit]
            logger.info("Rate limiter middleware initialized.")
        if limiter:
            app.state.limiter = limiter
            app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
            app.add_middleware(SlowAPIMiddleware)
    except FileNotFoundError as e:
        if ".env" in str(e):
            logger.warning("No .env file found, skipping rate limiter initialization.")
            return
        raise
