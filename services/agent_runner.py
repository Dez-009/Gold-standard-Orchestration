"""Execute agents with retry handling for transient failures."""

from __future__ import annotations

# Notes: Asyncio utilities used for sleep and timeout detection
import asyncio
import time
from typing import Awaitable, Callable

# Notes: Error classes from OpenAI client
from openai import RateLimitError
from sqlalchemy.orm import Session

from config.settings import get_settings
from services.orchestration_log_service import log_agent_run
from services.agent_failure_log import log_final_failure
from utils.logger import get_logger

settings = get_settings()
logger = get_logger()


async def run_with_retry(
    db: Session, user_id: int, agent_name: str, agent_call: Callable[[], Awaitable[str]]
) -> str:
    """Run ``agent_call`` retrying on transient failures."""

    # Notes: Track how many attempts have been made
    last_error: str | None = None
    start = time.perf_counter()

    for attempt in range(settings.MAX_AGENT_RETRIES + 1):
        try:
            result = await agent_call()
            elapsed_ms = int((time.perf_counter() - start) * 1000)
            # Notes: Log success along with retry count
            log_agent_run(
                db,
                agent_name,
                user_id,
                {
                    "execution_time_ms": elapsed_ms,
                    "input_tokens": 0,
                    "output_tokens": len(result),
                    "status": "success",
                    "fallback_triggered": False,
                    "timeout_occurred": False,
                    "retries": attempt,
                    "error_message": None,
                },
            )
            return result
        except (asyncio.TimeoutError, RateLimitError) as exc:
            # Notes: Capture transient failure and retry if attempts remain
            last_error = str(exc)
            logger.warning(
                "Transient error for agent %s on attempt %s: %s",
                agent_name,
                attempt + 1,
                last_error,
            )
            if attempt == settings.MAX_AGENT_RETRIES:
                break
            await asyncio.sleep(1)
        except Exception as exc:  # pragma: no cover - unexpected failure
            # Notes: Immediately abort on unknown error
            last_error = str(exc)
            break

    # Notes: Log failure when all attempts are exhausted
    timeout_flag = bool(last_error and "timeout" in last_error.lower())
    log_agent_run(
        db,
        agent_name,
        user_id,
        {
            "execution_time_ms": int((time.perf_counter() - start) * 1000),
            "input_tokens": 0,
            "output_tokens": 0,
            "status": "failed",
            "fallback_triggered": False,
            "timeout_occurred": timeout_flag,
            "retries": settings.MAX_AGENT_RETRIES,
            "error_message": last_error,
        },
    )
    log_final_failure(db, user_id, agent_name, last_error or "unknown")
    return ""

# Footnote: Used by higher level orchestration services to ensure robustness.
