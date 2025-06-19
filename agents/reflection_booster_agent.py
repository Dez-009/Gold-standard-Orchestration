"""Agent generating short prompts to deepen journal reflections."""

# Notes: Import the generic AI model adapter for provider flexibility
from services.ai_model_adapter import AIModelAdapter
from sqlalchemy.orm import Session
from orchestration.injector import inject_wearable_context

# Notes: Initialize adapter using the default OpenAI provider
adapter = AIModelAdapter("OpenAI")


# Notes: Build personalized reflection questions from journal context

def generate_reflection_prompt(
    journal_text: str,
    mood: str | None,
    goals: list[str] | None,
    db: Session | None = None,
    user_id: int | None = None,
) -> str:
    """Return 1-2 empathetic questions encouraging further introspection."""

    # Notes: Compose a user-facing block summarizing mood and goals
    mood_line = f"Mood: {mood}" if mood else "Mood: unknown"
    goals_line = f"Goals: {', '.join(goals)}" if goals else "Goals: none"

    # Notes: Craft the message list for the LLM
    messages = [
        {
            "role": "system",
            "content": (
                "You are Vida, an encouraging life coach who helps users reflect "
                "on their feelings. Ask 1-2 short, empathetic questions."
            ),
        },
        {
            "role": "user",
            "content": f"Journal:\n{journal_text}\n{mood_line}\n{goals_line}",
        },
    ]

    # Notes: Inject wearable sleep context when database info provided
    if db is not None and user_id is not None:
        messages = inject_wearable_context(db, user_id, messages)

    # Notes: Delegate generation to the adapter with mild creativity
    return adapter.generate(messages, temperature=0.6)

# Footnote: This agent is invoked after a journal is summarized to prompt deeper thought.
