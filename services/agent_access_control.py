"""Role-based access control utility for AI agents."""

from models.user import User

# Notes: Map agents to the minimum role required to use them
AGENT_ROLE_REQUIREMENTS: dict[str, list[str]] = {
    "GoalSuggestionAgent": ["pro_user", "admin"],
}


def is_agent_accessible(agent_name: str, user: User) -> bool:
    """Return True if the given user can access the specified agent."""

    # Notes: Agents not listed in the mapping are available to all roles
    allowed_roles = AGENT_ROLE_REQUIREMENTS.get(agent_name)
    if not allowed_roles:
        return True

    # Notes: Admin users bypass all role checks
    if user.role == "admin":
        return True

    # Notes: Grant access when the user's role is explicitly allowed
    return user.role in allowed_roles

# Footnote: Centralizes agent permission logic for orchestrator checks.
