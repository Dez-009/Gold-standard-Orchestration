"""Service functions for persisting agent execution logs."""

# Notes: Type hints for database session
from sqlalchemy.orm import Session

# Notes: ORM model representing agent execution logs
from models.agent_execution_log import AgentExecutionLog


def log_agent_execution(
    db: Session,
    user_id: int,
    agent_name: str,
    input_prompt: str,
    response_output: str,
    success: bool,
    execution_time_ms: int,
    error_message: str | None = None,
) -> AgentExecutionLog:
    """Create a new execution log entry."""

    # Notes: Instantiate the ORM object with provided fields
    log_entry = AgentExecutionLog(
        user_id=user_id,
        agent_name=agent_name,
        input_prompt=input_prompt,
        response_output=response_output,
        success=success,
        execution_time_ms=execution_time_ms,
        error_message=error_message,
    )
    # Notes: Persist the record to the database
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry

# Footnote: Handles creation of execution log records for agents.
