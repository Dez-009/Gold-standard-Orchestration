# Notes: Service for generating personalized goal recommendations
from __future__ import annotations

import json
from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from models.goal import Goal
from models.user import User
from services.segmentation_service import evaluate_segment
from services.ai_model_adapter import AIModelAdapter


# Notes: Generate 3-5 AI goal suggestions for each user in a segment

def generate_goals_for_segment(db: Session, segment_id: str | UUID) -> List[Goal]:
    """Return the list of created Goal objects."""

    # Notes: Retrieve all users matching the segment criteria
    users: List[User] = evaluate_segment(db, segment_id)

    # Notes: Initialize the AI adapter using the default provider
    adapter = AIModelAdapter("OpenAI")

    created: List[Goal] = []

    # Notes: Iterate over each user and request goal suggestions
    for user in users:
        prompt = (
            "Generate 3-5 short personal goals for the following user. "
            "Return JSON like {\"goals\": [\"goal1\", \"goal2\"]}. "
            f"User email: {user.email}"
        )
        response_text = adapter.generate(
            [
                {
                    "role": "system",
                    "content": (
                        "You are Vida, an AI Life Coach providing concise goal suggestions."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )

        # Notes: Attempt to parse the JSON response from the AI model
        try:
            data = json.loads(response_text)
            goals = data.get("goals", [])
            if not isinstance(goals, list):
                goals = []
        except Exception:
            goals = [g.strip("- ").strip() for g in response_text.splitlines() if g.strip()]

        # Notes: Create Goal objects for each suggestion
        for goal_text in goals[:5]:
            goal = Goal(user_id=user.id, title=str(goal_text))
            db.add(goal)
            created.append(goal)

    # Notes: Persist all created Goal records
    db.commit()
    for g in created:
        db.refresh(g)
    return created
