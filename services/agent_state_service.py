"""Service functions managing orchestration agent states."""

# Notes: Typing and datetime utilities
from datetime import datetime
from sqlalchemy.orm import Session

from models.agent_state import AgentState, AgentStateStatus

# Notes: Allowed transitions between agent states
ALLOWED_TRANSITIONS = {
    AgentStateStatus.ACTIVE: {
        AgentStateStatus.PAUSED,
        AgentStateStatus.SUSPENDED,
        AgentStateStatus.ERROR,
        AgentStateStatus.RETIRED,
    },
    AgentStateStatus.PAUSED: {
        AgentStateStatus.ACTIVE,
        AgentStateStatus.SUSPENDED,
        AgentStateStatus.RETIRED,
    },
    AgentStateStatus.SUSPENDED: {
        AgentStateStatus.ACTIVE,
        AgentStateStatus.RETIRED,
    },
    AgentStateStatus.ERROR: {
        AgentStateStatus.ACTIVE,
        AgentStateStatus.RETIRED,
    },
    AgentStateStatus.RETIRED: set(),
}


def set_agent_state(db: Session, user_id: int, agent_name: str, state: str) -> AgentState:
    """Create or update the state record for a given agent."""

    # Notes: Cast input to enum and validate
    try:
        new_state = AgentStateStatus(state)
    except ValueError as exc:
        raise ValueError(f"Invalid state: {state}") from exc

    # Notes: Look for existing record to update
    record = (
        db.query(AgentState)
        .filter(AgentState.user_id == user_id, AgentState.agent_name == agent_name)
        .one_or_none()
    )

    if record:
        # Notes: Validate transition from current to new state
        if new_state not in ALLOWED_TRANSITIONS[record.state]:
            raise ValueError(
                f"Invalid transition from {record.state} to {new_state}"
            )
        # Notes: Update state and timestamp
        record.state = new_state
        record.updated_at = datetime.utcnow()
    else:
        # Notes: Create new state row when none exists
        record = AgentState(
            user_id=user_id,
            agent_name=agent_name,
            state=new_state,
            created_at=datetime.utcnow(),
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


def list_all_states(db: Session, limit: int = 100, offset: int = 0) -> list[AgentState]:
    """Return all agent state rows ordered by most recently updated."""

    # Notes: Query with pagination parameters
    return (
        db.query(AgentState)
        .order_by(AgentState.updated_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


# Footnote: This service centralizes agent state validation and storage logic

