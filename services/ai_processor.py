# Notes: Import required modules for OpenAI client and application settings
from openai import OpenAI
from config import get_settings

# Notes: Import function for retrieving user context memory
from services.ai_memory_service import get_user_context_memory

# Notes: Import SQLAlchemy Session type for typing the database argument
from sqlalchemy.orm import Session

# Notes: Initialize settings and OpenAI client using the API key from settings
settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

# Notes: Define system prompt describing Vida's persona
SYSTEM_PROMPT = (
    "You are Vida, an AI Life Coach with a supportive, real-talk personality. "
    "You speak like a wise friend, help users clarify goals, stay accountable, "
    "ask powerful reflection questions, give example choices, and close with "
    "next steps."
)


# Notes: Generate Vida's response using optional user context memory


def generate_ai_response(db: Session, user_id: int, user_prompt: str) -> str:
    """Return the AI-generated response for the given user prompt."""

    # Notes: Retrieve recent coaching context for this user
    memory = get_user_context_memory(db, user_id)

    # Notes: Start with the default system prompt
    system_prompt = SYSTEM_PROMPT

    # Notes: If memory is available, append it to the system prompt
    if memory:
        system_prompt = f"""
You are Vida, an AI Life Coach with a supportive, real-talk personality. You speak like a wise friend, help users clarify goals, stay accountable, ask powerful reflection questions, give example choices, and close with next steps.

Here is user context memory:
{memory}
"""

    # Notes: Send the prompt to OpenAI's chat completion endpoint
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.8,
        max_tokens=1024,
    )

    # Notes: Return only the text portion of the first choice
    return response.choices[0].message.content


# Notes: Suggest new goals for a user based on their context memory


def suggest_goals(db: Session, user_id: int) -> str:
    """Return a numbered list of 3-5 suggested goals for the user."""

    # Notes: Gather recent session and journal information for context
    memory = get_user_context_memory(db, user_id)

    # Notes: Define the instruction for the AI on how to craft the goal list
    system_prompt = (
        "You are Vida, an AI Life Coach. Based on the user's recent history, "
        "suggest 3-5 actionable personal goals. Provide them as a simple numbered list."
    )

    # Notes: Call the OpenAI chat completion API with the context memory
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": memory},
        ],
        temperature=0.7,
        max_tokens=512,
    )

    # Notes: Return the generated goals as a string
    return response.choices[0].message.content
