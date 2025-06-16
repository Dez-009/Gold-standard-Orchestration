"""Routing layer to delegate AI coaching requests to domain agents."""

# Notes: Import typing for SQLAlchemy session operations
from sqlalchemy.orm import Session

# Notes: Import ORM models needed for routing and history
from models.agent_assignment import AgentAssignment
from models.agent_interaction_log import AgentInteractionLog


# Notes: Stub implementation for the career coaching agent
def call_career_agent(prompt: str, context: str) -> str:
    """Return a placeholder career coaching response."""
    return f"Career advice for: {prompt}\n\nPrevious context:\n{context}"


# Notes: Stub implementation for the health coaching agent
def call_health_agent(prompt: str, context: str) -> str:
    """Return a placeholder health coaching response."""
    return f"Health tips for: {prompt}\n\nPrevious context:\n{context}"


# Notes: Stub implementation for the relationship coaching agent
def call_relationship_agent(prompt: str, context: str) -> str:
    """Return a placeholder relationship coaching response."""
    return f"Relationship guidance for: {prompt}\n\nPrevious context:\n{context}"


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
    response_text = handler(user_prompt, context)

    # Notes: Return both the agent type and the generated text
    return {"agent": assignment.agent_type, "response": response_text}
