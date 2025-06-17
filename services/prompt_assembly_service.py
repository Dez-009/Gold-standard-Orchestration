"""Service for assembling prompts for each AI coach agent."""

from __future__ import annotations

# Notes: Map agent types to their persona system prompts
AGENT_PERSONAS = {
    "career": "You are a helpful career coach.",
    "health": "You are a supportive wellness coach.",
    "relationships": "You are a compassionate relationship coach.",
    "finance": "You are a knowledgeable financial coach.",
    "mental_health": "You are an encouraging mindset coach.",
}


def build_agent_prompt(agent_type: str, user_memory_context: str, user_prompt: str) -> list[dict[str, str]]:
    """Return message payload ready for an LLM call."""

    # Notes: Retrieve the system prompt template for this agent type
    system_message = AGENT_PERSONAS.get(agent_type)
    if system_message is None:
        raise ValueError("Unknown agent type")

    # Notes: Begin the payload with the persona system message
    messages: list[dict[str, str]] = [{"role": "system", "content": system_message}]

    # Notes: Inject the summarized user memory context when provided
    if user_memory_context:
        messages.append({"role": "system", "content": user_memory_context})

    # Notes: Append the current user prompt to close out the conversation setup
    messages.append({"role": "user", "content": user_prompt})

    return messages

# Footnote: Generates complete agent prompt for orchestrated LLM calls with contextual memory injection.
