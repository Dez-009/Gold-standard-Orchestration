"""Async executor applying timeout and retry logic to agent calls."""

from __future__ import annotations

import asyncio
import time
from typing import Awaitable, Callable

from sqlalchemy.orm import Session

from config import AGENT_MAX_RETRIES, AGENT_TIMEOUT_SECONDS
from services.orchestration_log_service import log_agent_run
from utils.logger import get_logger

logger = get_logger()


async def execute_agent(
    db: Session,
    agent_name: str,
    user_id: int,
    agent_call: Callable[[], Awaitable[str]],
) -> str:
    """Run ``agent_call`` with timeout and retry handling."""

    # Notes: Track timing and diagnostic info
    start = time.perf_counter()
    timeout_occurred = False
    error_message: str | None = None
    retries = 0
    status = "success"

    for attempt in range(AGENT_MAX_RETRIES + 1):
        try:
            # Notes: Enforce timeout for each attempt
            result = await asyncio.wait_for(agent_call(), AGENT_TIMEOUT_SECONDS)
            status = "success"
            break
        except asyncio.TimeoutError as exc:
            # Notes: Mark that a timeout happened and prepare for retry
            timeout_occurred = True
            error_message = str(exc)
            status = "timeout"
        except Exception as exc:  # pragma: no cover - generic failure capture
            error_message = str(exc)
            status = "failed"
        if attempt == AGENT_MAX_RETRIES:
            # Notes: Give up after exceeding retry count
            result = ""
            retries = attempt
            break
        retries = attempt + 1
        logger.warning(
            "Retrying agent %s due to failure (%s). Attempt %s/%s",
            agent_name,
            error_message,
            retries,
            AGENT_MAX_RETRIES,
        )
        # Notes: Backoff delay grows with each retry
        delay = 2 if attempt == 0 else 5
        await asyncio.sleep(delay)
    elapsed_ms = int((time.perf_counter() - start) * 1000)

    # Notes: Record performance metrics for monitoring
    log_agent_run(
        db,
        agent_name,
        user_id,
        {
            "execution_time_ms": elapsed_ms,
            "input_tokens": 0,
            "output_tokens": len(result),
            "status": status,
            "fallback_triggered": False,
            "timeout_occurred": timeout_occurred,
            "retries": retries,
            "error_message": error_message,
        },
    )
    return result

