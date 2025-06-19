"""Utility service for processing admin agent queries."""

# Notes: Standard library imports used for date calculations and regex parsing
from datetime import datetime, timedelta
import re
from typing import Any, Dict

# Notes: SQLAlchemy session and models required for database access
from sqlalchemy.orm import Session

from models.user import User
from models.session import Session as SessionModel
from models.goal import Goal
from models.subscription import Subscription
from services import audit_log_service
from utils.logger import get_logger

logger = get_logger()


def process_admin_query(user_prompt: str, db: Session) -> Dict[str, Any]:
    """Interpret the admin's question and return a structured response."""

    # Notes: Normalize the prompt for keyword matching
    prompt = user_prompt.lower()
    response: Dict[str, Any] = {}

    if "audit" in prompt and "log" in prompt:
        # Notes: Return the ten most recent audit log records
        logs = audit_log_service.get_recent_audit_logs(db, limit=10)
        response["audit_logs"] = [
            {
                "id": log.id,
                "timestamp": log.timestamp.isoformat(),
                "user_id": log.user_id,
                "action": log.action,
                "detail": log.detail,
            }
            for log in logs
        ]
    elif "subscription" in prompt and "status" in prompt:
        # Notes: Attempt to extract the target email from the prompt
        match = re.search(r"([\w\.-]+@[\w\.-]+)", user_prompt)
        subscription = None
        if match:
            email = match.group(1)
            subscription = (
                db.query(Subscription)
                .join(User, Subscription.user_id == User.id)
                .filter(User.email == email)
                .first()
            )
        response["subscription_status"] = (
            subscription.status if subscription else "unknown"
        )
    elif "inactive" in prompt and "user" in prompt:
        # Notes: Find users without recent sessions or goals within 30 days
        cutoff = datetime.utcnow() - timedelta(days=30)
        users = (
            db.query(User)
            .outerjoin(
                SessionModel,
                (SessionModel.user_id == User.id)
                & (SessionModel.updated_at >= cutoff),
            )
            .outerjoin(
                Goal,
                (Goal.user_id == User.id) & (Goal.updated_at >= cutoff),
            )
            .filter(SessionModel.id.is_(None))
            .filter(Goal.id.is_(None))
            .all()
        )
        response["inactive_users"] = [
            {"id": user.id, "email": user.email} for user in users
        ]
    else:
        # Notes: Fallback branch when no intent matches
        response["message"] = "Unable to parse request"

    # Notes: Persist the query and resulting payload to the audit log
    audit_log_service.create_audit_log(
        db,
        {
            "user_id": 0,
            "action": "admin_agent_query",
            "detail": f"prompt={user_prompt} response={response}",
        },
    )
    logger.info("Processed admin agent query: %s", user_prompt)

    return response
