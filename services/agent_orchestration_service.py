"""Routing layer to delegate AI coaching requests to domain agents."""

# Notes: Import typing for SQLAlchemy session operations
from sqlalchemy.orm import Session

# Notes: Import ORM models needed for routing and history
from models.agent_assignment import AgentAssignment
from models.agent_interaction_log import AgentInteractionLog
# Notes: Import user personality models for system prompt lookup
from models.user_personality import UserPersonality
from models.personality import Personality

# Notes: Import OpenAI client and settings helper
from openai import OpenAI
from config import get_settings

# Notes: Initialize OpenAI client using API key from settings
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

# Notes: Default system prompt used when no personality assignment exists
DEFAULT_SYSTEM_PROMPT = (
    "You are Vida, an AI Life Coach with a supportive, real-talk personality. "
    "You speak like a wise friend, help users clarify goals, stay accountable, "
    "ask powerful reflection questions, give example choices, and close with "
    "next steps."
)


# Notes: Retrieve a user's personality assignment for a domain
def get_personality_assignment(db: Session, user_id: int, domain: str) -> UserPersonality | None:
    """Return the personality assignment matching the user and domain."""

    return (
        db.query(UserPersonality)
        .filter_by(user_id=user_id, domain=domain)
        .join(Personality)
        .first()
    )


# Notes: Generate an AI response using the chosen personality or fallback
def generate_ai_response(
    db: Session, user_id: int, domain: str, user_prompt: str
) -> str:
    """Return the OpenAI completion text using the user's personality."""

    # Notes: Look up any personality assigned for this domain
    assignment = get_personality_assignment(db, user_id, domain)
    if assignment:
        system_prompt = assignment.personality.system_prompt
    else:
        system_prompt = DEFAULT_SYSTEM_PROMPT

    # Notes: Call the OpenAI chat completion endpoint with the prompt
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=1024,
    )

    # Notes: Return only the response text from the first choice
    return response.choices[0].message.content


# Notes: Stub implementation for the career coaching agent
def call_career_agent(db: Session, user_id: int, prompt: str, context: str) -> str:
    """Return a career coaching response from OpenAI."""
    full_prompt = f"{prompt}\n\nPrevious context:\n{context}"
    return generate_ai_response(db, user_id, "career", full_prompt)


# Notes: Stub implementation for the health coaching agent
def call_health_agent(db: Session, user_id: int, prompt: str, context: str) -> str:
    """Return a health coaching response from OpenAI."""
    full_prompt = f"{prompt}\n\nPrevious context:\n{context}"
    return generate_ai_response(db, user_id, "health", full_prompt)


# Notes: Stub implementation for the relationship coaching agent
def call_relationship_agent(db: Session, user_id: int, prompt: str, context: str) -> str:
    """Return a relationship coaching response from OpenAI."""
    full_prompt = f"{prompt}\n\nPrevious context:\n{context}"
    return generate_ai_response(db, user_id, "relationship", full_prompt)


# Notes: Map agent types to their corresponding handler functions
AGENT_HANDLERS = {
    "career": call_career_agent,
    "health": call_health_agent,
    "relationship": call_relationship_agent,
}


# Notes: Select an agent for the user and return the generated response

def route_ai_request(db: Session, user_id: int, user_prompt: str) -> dict:
    """Route the user's prompt to the assigned agent and return its reply."""

    # Notes: Look up the user's first assigned agent record
    assignment = (
        db.query(AgentAssignment)
        .filter(AgentAssignment.user_id == user_id)
        .first()
    )

    # Notes: If the user has no agent assigned, raise an error for the caller
    if assignment is None:
        raise ValueError("No agent assigned to user")

    # Notes: Determine which handler should process the request
    handler = AGENT_HANDLERS.get(assignment.agent_type)
    if handler is None:
        # Notes: Default to the career agent when type is unrecognized
        handler = call_career_agent

    # Notes: Gather prior interactions to provide context
    logs = (
        db.query(AgentInteractionLog)
        .filter(AgentInteractionLog.user_id == user_id)
        .order_by(AgentInteractionLog.timestamp.desc())
        .limit(5)
        .all()
    )

    # Notes: Build a single string summarizing the conversation history
    history_snippets: list[str] = []
    for log in logs:
        history_snippets.append(f"User: {log.user_prompt}\nAI: {log.ai_response}")
    context = "\n".join(reversed(history_snippets))

    # Notes: Generate the agent's reply using the selected handler and context
    response_text = handler(db, user_id, user_prompt, context)

    # Notes: Return both the agent type and the generated text
    return {"agent": assignment.agent_type, "response": response_text}
