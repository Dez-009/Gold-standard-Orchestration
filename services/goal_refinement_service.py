# Notes: Service that refines user goals using journal context
from __future__ import annotations

import json
from services.ai_model_adapter import AIModelAdapter


# Notes: Generate improved or more actionable goals
# Takes the user's id for tracking, a list of existing goals, and tags
# extracted from their journals. Returns a list of refined goal strings.
def refine_goals(user_id: int, existing_goals: list[str], journal_tags: list[str]) -> list[str]:
    """Return AI-refined goals using the provided context."""

    # Notes: Initialize the AI adapter with the default provider
    adapter = AIModelAdapter("OpenAI")

    # Notes: Craft an instruction describing how the AI should refine the goals
    system_prompt = (
        "You are Vida, an AI Life Coach. Using the user's current goals and "
        "themes from their journal, rewrite or refine each goal so it is more "
        "specific and actionable. Return JSON like {\"refined_goals\": [\"goal1\", \"goal2\"]}."
    )

    # Notes: Build the user message containing existing goals and journal tags
    goals_text = "\n".join(f"- {g}" for g in existing_goals)
    tags_text = ", ".join(journal_tags)
    user_prompt = f"Existing Goals:\n{goals_text}\n\nJournal Tags: {tags_text}"

    # Notes: Send the prompt to the AI model and capture the response
    response = adapter.generate(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
    )

    # Notes: Attempt to parse the response as JSON to extract the list
    try:
        data = json.loads(response)
        refined = data.get("refined_goals", [])
        if isinstance(refined, list):
            return [str(g).strip() for g in refined]
    except Exception:
        pass

    # Notes: Fallback when JSON parsing fails - split by newlines
    return [line.strip("- ").strip() for line in response.splitlines() if line.strip()]
