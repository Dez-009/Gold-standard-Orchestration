# Notes: Schemas used by the goal refinement endpoint
from pydantic import BaseModel


# Notes: Request payload sent to the refinement route
class GoalRefinementRequest(BaseModel):
    """Model describing the goals and journal tags provided by the user."""

    existing_goals: list[str]
    journal_tags: list[str]


# Notes: Response returned after refining the goals
class GoalRefinementResponse(BaseModel):
    """Model containing the list of AI-refined goals."""

    refined_goals: list[str]
