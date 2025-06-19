"""Simplified orchestrator executing a single agent with versioned prompts."""

from __future__ import annotations

# Notes: Standard library helpers for timing execution
import time
from sqlalchemy.orm import Session

# Notes: Service helpers used by the orchestrator
from services import prompt_version_service
from services.ai_model_adapter import AIModelAdapter
from services.orchestration_log_service import log_agent_run


async def run_agent(db: Session, user_id: int, agent_name: str, user_prompt: str) -> str:
    """Execute ``agent_name`` using the latest stored prompt template."""

    # Notes: Retrieve the most recent prompt version for the agent
    version_row = prompt_version_service.get_latest_prompt(db, agent_name)
    template = version_row.prompt_template if version_row else "You are a helpful coach."
    metadata = version_row.metadata_json or {} if version_row else {}

    # Notes: Initialize the model adapter with default provider
    adapter = AIModelAdapter("OpenAI")
    temperature = float(metadata.get("temperature", 0.7))

    # Notes: Compose the message payload including the system prompt
    messages = [
        {"role": "system", "content": template},
        {"role": "user", "content": user_prompt},
    ]

    start = time.perf_counter()
    response_text = adapter.generate(messages, temperature=temperature)
    elapsed_ms = int((time.perf_counter() - start) * 1000)

    # Notes: Persist performance metrics linking back to the prompt version
    log_agent_run(
        db,
        agent_name,
        user_id,
        {
            "execution_time_ms": elapsed_ms,
            "input_tokens": len(str(messages)),
            "output_tokens": len(response_text),
            "status": "success",
            "fallback_triggered": False,
            "timeout_occurred": False,
            "retries": 0,
            "error_message": None,
            "prompt_version": version_row.version if version_row else None,
        },
    )

    return response_text

# Footnote: Future iterations may orchestrate multiple agents in parallel.
