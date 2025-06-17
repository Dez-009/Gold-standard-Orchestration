"""Service functions managing orchestration agent states."""

# Notes: Typing and datetime utilities
from datetime import datetime
from sqlalchemy.orm import Session

from models.agent_state import AgentState


VALID_STATES = {"idle", "active", "waiting", "error", "paused"}


def set_agent_state(db: Session, user_id: int, agent_name: str, state: str) -> AgentState:
    """Create or update the state record for a given agent."""

    # Notes: Validate incoming state string
    if state not in VALID_STATES:
        raise ValueError(f"Invalid state: {state}")

    # Notes: Look for existing record to update
    record = (
        db.query(AgentState)
        .filter(AgentState.user_id == user_id, AgentState.agent_name == agent_name)
        .one_or_none()
    )

    if record:
        # Notes: Update state and timestamp
        record.state = state
        record.updated_at = datetime.utcnow()
    else:
        # Notes: Create new state row when none exists
        record = AgentState(
            user_id=user_id,
            agent_name=agent_name,
            state=state,
            updated_at=datetime.utcnow(),
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return record


def get_agent_state(db: Session, user_id: int, agent_name: str) -> AgentState | None:
    """Return the state record for the specified agent if present."""

    return (
        db.query(AgentState)
        .filter(AgentState.user_id == user_id, AgentState.agent_name == agent_name)
        .one_or_none()
    )

