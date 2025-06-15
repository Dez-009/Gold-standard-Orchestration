from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from utils.logger import get_logger
from config import get_settings


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
    if limiter is None:
        settings = get_settings()
        limiter = Limiter(
            key_func=get_remote_address,
            default_limits=[settings.RATE_LIMIT],
        )
        if default_limit:
            limiter.default_limits = [default_limit]
        logger.info("Rate limiter middleware initialized.")
    if limiter:
        app.state.limiter = limiter
        app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
        app.add_middleware(SlowAPIMiddleware)
