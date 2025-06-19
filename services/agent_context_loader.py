"""Service utilities for loading user agent context."""

# Notes: Provides type hints for database session
from sqlalchemy.orm import Session

# Notes: Import the ORM model storing agent states
from models.agent_state import AgentState, AgentStateStatus


def load_agent_context(db: Session, user_id: int) -> list[str]:
    """Return names of agents currently active for the user."""

    # Notes: Query all state records for the given user id
    states = db.query(AgentState).filter(AgentState.user_id == user_id).all()

    if not states:
        # Notes: No state rows implies no restrictions; return empty list
        return []

    # Notes: Filter the records to only include ACTIVE agents
    active_agents = [
        state.agent_name
        for state in states
        if state.state == AgentStateStatus.ACTIVE
    ]
    return active_agents


def is_agent_active(db: Session, user_id: int, agent_name: str) -> bool:
    """Determine if a specific agent is active for the user."""

    # Notes: Fetch the state record for the agent if present
    state = (
        db.query(AgentState)
        .filter(
            AgentState.user_id == user_id,
            AgentState.agent_name == agent_name,
        )
        .one_or_none()
    )

    if state is None:
        # Notes: Missing record means the agent is active by default
        return True

    return state.state == AgentStateStatus.ACTIVE


# Footnote: Provides helper functions for reading agent states.
