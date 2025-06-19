"""Async executor applying timeout and retry logic to agent calls."""

from __future__ import annotations

import asyncio
import time
from typing import Awaitable, Callable
from dataclasses import dataclass

from sqlalchemy.orm import Session

from config import AGENT_MAX_RETRIES, AGENT_TIMEOUT_SECONDS
from services.orchestration_log_service import log_agent_run
from services import agent_toggle_service, user_service, agent_access_service
from utils.logger import get_logger
from monitoring.logger import log_performance

logger = get_logger()


@dataclass
class AgentOutput:
    """Container returned by ``execute_agent`` including diagnostic flags."""

    # Notes: Final text produced by the agent or empty when failed
    text: str
    # Notes: Total number of retries performed before success or giving up
    retry_count: int
    # Notes: Whether any attempt exceeded the timeout threshold
    timeout_occurred: bool


async def execute_agent(
    db: Session,
    agent_name: str,
    user_id: int,
    agent_call: Callable[[], Awaitable[str]],
) -> AgentOutput:
    """Run ``agent_call`` with timeout and retry handling."""

    # Notes: Bypass execution when admin disabled the agent
    if not agent_toggle_service.is_agent_enabled(db, agent_name):
        log_agent_run(
            db,
            agent_name,
            user_id,
            {
                "execution_time_ms": 0,
                "input_tokens": 0,
                "output_tokens": 0,
                "status": "disabled_by_admin",
                "fallback_triggered": False,
                "timeout_occurred": False,
                "retries": 0,
                "error_message": None,
            },
        )
        logger.info("Agent %s skipped due to admin toggle", agent_name)
        return AgentOutput(text="", retry_count=0, timeout_occurred=False)

    # Notes: Enforce subscription tier access policy
    user = user_service.get_user(db, user_id)
    if user and not agent_access_service.is_agent_enabled_for_user(db, agent_name, user):
        log_agent_run(
            db,
            agent_name,
            user_id,
            {
                "execution_time_ms": 0,
                "input_tokens": 0,
                "output_tokens": 0,
                "status": "disabled_by_plan",
                "fallback_triggered": False,
                "timeout_occurred": False,
                "retries": 0,
                "error_message": "Disabled by plan",
            },
        )
        logger.info("Agent %s blocked for user %s due to plan", agent_name, user_id)
        return AgentOutput(text="", retry_count=0, timeout_occurred=False)

    # Notes: Track timing and diagnostic info
    start = time.perf_counter()
    timeout_occurred = False
    error_message: str | None = None
    retries = 0
    status = "success"
    result = ""

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
    if elapsed_ms > 1000:
        log_performance("agent_latency_ms", float(elapsed_ms), {"agent": agent_name, "user_id": user_id})
    return AgentOutput(
        text=result,
        retry_count=retries,
        timeout_occurred=timeout_occurred,
    )

