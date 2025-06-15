# Notes: Import required modules for OpenAI client and application settings
from openai import OpenAI
from config import get_settings

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


# Notes: Generate Vida's response based on the user's prompt


def generate_ai_response(user_prompt: str) -> str:
    """Return the AI-generated response for the given user prompt."""
    # Notes: Send the prompt to OpenAI's chat completion endpoint
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.8,
        max_tokens=1024,
    )
    # Notes: Return only the text portion of the first choice
    return response.choices[0].message.content
