"""Service for logging agent lifecycle events."""

# Notes: Used for type hints and DB operations
from sqlalchemy.orm import Session
import json
from datetime import datetime

# Notes: ORM model representing lifecycle log entries
from models.agent_lifecycle_log import AgentLifecycleLog


def log_agent_event(
    db: Session,
    user_id: int,
    agent_name: str,
    event_type: str,
    details: dict | None = None,
) -> AgentLifecycleLog:
    """Persist a lifecycle event for an agent."""

    # Notes: Convert details dict to JSON if provided
    details_json = json.dumps(details) if details else None

    # Notes: Create the ORM instance and commit to the database
    entry = AgentLifecycleLog(
        user_id=user_id,
        agent_name=agent_name,
        event_type=event_type,
        timestamp=datetime.utcnow(),
        details=details_json,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def list_agent_events(
    db: Session,
    agent_name: str | None = None,
    event_type: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    limit: int = 100,
    offset: int = 0,
) -> list[AgentLifecycleLog]:
    """Return lifecycle events filtered by the given parameters."""

    query = db.query(AgentLifecycleLog)
    if agent_name:
        query = query.filter(AgentLifecycleLog.agent_name == agent_name)
    if event_type:
        query = query.filter(AgentLifecycleLog.event_type == event_type)
    if start_date:
        query = query.filter(AgentLifecycleLog.timestamp >= start_date)
    if end_date:
        query = query.filter(AgentLifecycleLog.timestamp <= end_date)

    return (
        query.order_by(AgentLifecycleLog.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
