"""Helper running an agent with a global timeout."""

from __future__ import annotations

# Notes: asyncio provides the timeout utility
import asyncio
from typing import Awaitable, Callable

from sqlalchemy.orm import Session

# Notes: Load timeout setting from configuration
from config.settings import get_settings
from services.agent_timeout_log import log_timeout
from utils.logger import get_logger

settings = get_settings()
logger = get_logger()


async def run_with_timeout(
    db: Session,
    user_id: int,
    agent_name: str,
    agent_call: Callable[[], Awaitable[str]],
) -> dict:
    """Execute ``agent_call`` enforcing the configured timeout."""

    try:
        # Notes: Cancel the task if it exceeds ``AGENT_TIMEOUT_SECONDS``
        result = await asyncio.wait_for(agent_call(), settings.AGENT_TIMEOUT_SECONDS)
        return {"response": result}
    except asyncio.TimeoutError:
        # Notes: Persist the timeout so operations can investigate later
        log_timeout(db, user_id, agent_name)
        logger.warning("Agent %s timed out for user %s", agent_name, user_id)
        return {"error": "timeout"}

# Footnote: Higher level services can build retry loops around this helper.
