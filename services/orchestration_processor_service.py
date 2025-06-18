"""Service orchestrating multi-agent execution for a user prompt."""

from __future__ import annotations

# Notes: SQLAlchemy session type for database access
from sqlalchemy.orm import Session

# Notes: ORM model storing personality assignments per user
from models.user_personality import UserPersonality

# Notes: Import individual agent processors
from services.agents import (
    career_agent,
    wellness_agent,
    relationship_agent,
    financial_agent,
    mindset_agent,
)

# Notes: Service used to record execution details
from services.agent_execution_log_service import log_agent_execution
# Notes: Performance logging service capturing timeout information
from services.orchestration_log_service import log_agent_run
# Notes: Import prompt builder to inject personalization
# Notes: Import prompt builder to inject personalization
from services.agent_prompt_builder import build_personalized_prompt
# Notes: Import memory context builder to provide conversation history
from services.conversation_memory_service import build_memory_context
# Notes: Import prompt assembly helper for building agent requests
from services.prompt_assembly_service import build_agent_prompt
from orchestration.injector import apply_persona_token
# Notes: Utility to check if an agent is currently active
# Notes: Import utilities for loading and checking agent state context
from services.agent_context_loader import load_agent_context, is_agent_active
# Notes: Import the decision logic that recommends which agents to run
from services.orchestration_decision_service import determine_agent_flow
# Notes: Import the aggregator used after parallel execution
from services.response_aggregation_service import aggregate_agent_responses
from services.agent_scoring_service import score_agent_responses
from services.agent_access_control import is_agent_accessible
from services.user_service import get_user
from utils.logger import get_logger

logger = get_logger()

from models.agent_score import AgentScore

# Notes: Timing utility for measuring execution latency
import time

# Notes: Map domain names to their processor functions
AGENT_PROCESSORS = {
    "career": career_agent.process,
    "health": wellness_agent.process,
    "relationships": relationship_agent.process,
    "finance": financial_agent.process,
    "mental_health": mindset_agent.process,
}


# Notes: Process the user prompt with all assigned agents

def process_user_prompt(db: Session, user_id: int, user_prompt: str) -> list[dict]:
    """Return responses from each agent assigned to the user."""

    # Notes: Fetch the user object to evaluate role-based permissions
    user = get_user(db, user_id)

    # Notes: Retrieve all personality assignments for the user
    assignments = (
        db.query(UserPersonality)
        .filter(UserPersonality.user_id == user_id)
        .all()
    )

    # Notes: Consult the decision service to pick agents relevant to this prompt
    recommended = determine_agent_flow(db, user_id, user_prompt)

    # Notes: Build a single memory block summarizing prior context for the prompt
    memory_context = build_memory_context(db, user_id, recommended, user_prompt)

    # Notes: Keep only assignments that were recommended by the decision logic
    if recommended:
        assignments = [a for a in assignments if a.domain in recommended]

    # Notes: Determine which agents are active for the user one time up front
    active_agents = load_agent_context(db, user_id)

    responses: list[dict] = []

    # Notes: Execute each agent processor and log execution details
    for assignment in assignments:
        # Notes: When a list of active agents was returned, skip agents not in it
        if active_agents and assignment.domain not in active_agents:
            continue

        # Notes: When no list was returned, fall back to individual state check
        if not active_agents and not is_agent_active(db, user_id, assignment.domain):
            continue

        # Notes: Skip execution when the user's role does not permit this agent
        if not is_agent_accessible(assignment.domain, user):
            logger.info(
                "User %s with role %s blocked from agent %s",
                user_id,
                user.role,
                assignment.domain,
            )
            continue

        processor = AGENT_PROCESSORS.get(assignment.domain)
        if processor is None:
            # Notes: Skip domains without a matching processor
            continue
        start = time.perf_counter()
        try:
            # Notes: Apply user personalization before assembling the final messages
            personalized_prompt = build_personalized_prompt(
                db, user_id, assignment.domain, user_prompt
            )
            # Notes: Build the message list using the new prompt assembly helper
            messages = build_agent_prompt(
                assignment.domain,
                memory_context,
                personalized_prompt,
            )
            # Notes: Inject persona token context when available
            messages = apply_persona_token(
                db, user_id, assignment.domain, messages
            )
            # Notes: Execute the agent using the assembled message payload
            result_text = processor(messages)
            success = True
            error_message = None
        except Exception as exc:  # pragma: no cover - generic failure capture
            result_text = ""
            success = False
            error_message = str(exc)
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        # Notes: Persist execution metrics regardless of success
        log_agent_execution(
            db,
            user_id,
            assignment.domain,
            user_prompt,
            result_text,
            success,
            elapsed_ms,
            error_message,
        )
        if success:
            responses.append({"agent": assignment.domain, "response": result_text})

    # Notes: Aggregated list of agent responses is returned to the caller
    return responses
# Footnote: Coordinates calling each domain agent and filters them using
# Notes: `load_agent_context` so only active agents generate responses.


# Notes: Execute multiple agents concurrently using asyncio

def run_parallel_agents(
    user_id: int,
    user_prompt: str,
    agent_list: list[str],
    db: Session,
    timeout_seconds: int = 10,
) -> dict[str, dict]:
    """Return mapping of agent names to their LLM responses.

    The timeout_seconds parameter limits how long each agent may run before
    marking the result as a timeout. This prevents the orchestration layer from
    hanging indefinitely when an agent is slow to respond."""

    import asyncio
    from services.llm_call_service import call_llm

    # Notes: Retrieve the user once to evaluate permissions for each agent
    user = get_user(db, user_id)

    # Notes: Filter the agent list based on role access rules
    allowed_agents: list[str] = []
    for name in agent_list:
        if is_agent_accessible(name, user):
            allowed_agents.append(name)
        else:
            logger.info(
                "User %s with role %s blocked from agent %s",
                user_id,
                user.role,
                name,
            )

    # Notes: Inner coroutine used for each agent execution
    async def _execute(agent_name: str) -> tuple[str, dict]:
        # Notes: Build personalized memory context for the user and agent
        memory = build_memory_context(db, user_id, [agent_name], user_prompt)
        prompt = build_agent_prompt(agent_name, memory, user_prompt)
        # Notes: Attach persona token details to the prompt
        prompt = apply_persona_token(db, user_id, agent_name, prompt)
        start = time.perf_counter()
        try:
            # Notes: Enforce timeout on the blocking LLM call
            text = await asyncio.wait_for(
                asyncio.to_thread(call_llm, prompt), timeout_seconds
            )
            status = "success"
            timed_out = False
        except asyncio.TimeoutError:
            # Notes: Provide fallback content when the call exceeds the limit
            text = "This agent took too long to respond."
            status = "timeout"
            timed_out = True
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        # Notes: Record metrics to the orchestration performance log
        log_agent_run(
            db,
            agent_name,
            user_id,
            {
                "execution_time_ms": elapsed_ms,
                "input_tokens": len(str(prompt)),
                "output_tokens": len(str(text)),
                "status": status,
                "fallback_triggered": False,
                "timeout_occurred": timed_out,
            },
        )
        return agent_name, {"status": status, "content": text}

    # Notes: Gather results for all agents concurrently
    async def _gather() -> list[tuple[str, str]]:
        tasks = [_execute(name) for name in allowed_agents]
        return await asyncio.gather(*tasks)

    # Notes: Run the event loop and format the output as a dictionary
    pairs = asyncio.run(_gather())
    return {name: resp for name, resp in pairs}

# Footnote: Provides parallel execution path for orchestrating multiple agents.


# Notes: Run agents in parallel then combine responses for display
def orchestrate_and_summarize(
    user_id: int, user_prompt: str, agent_list: list[str], db: Session
) -> str:
    """Return aggregated coaching summary from parallel agent results."""

    # Notes: Execute agents concurrently and collect the raw mapping
    raw_responses = run_parallel_agents(user_id, user_prompt, agent_list, db)

    # Notes: Reduce the mapping into a single formatted text block
    summary = aggregate_agent_responses(raw_responses)

    # Notes: Generate quality scores for each agent response
    score_input = [
        (name, data["content"]) for name, data in raw_responses.items()
    ]
    results = score_agent_responses(user_id, score_input)

    # Notes: Persist scoring results for future analysis
    for agent, metrics in results["scores"].items():
        row = AgentScore(
            user_id=user_id,
            agent_name=agent,
            completeness_score=metrics["completeness_score"],
            clarity_score=metrics["clarity_score"],
            relevance_score=metrics["relevance_score"],
        )
        db.add(row)
    db.commit()

    return summary

# Footnote: Executes parallel agents and aggregates them into one summary string.

