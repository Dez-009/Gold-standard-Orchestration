from openai import OpenAI, AuthenticationError

from config import get_settings


# Notes: OpenAI client configured with API key from settings
client = OpenAI(api_key=get_settings().openai_api_key)

SYSTEM_MESSAGE = (
    "You are Vida, an AI Life Coach. Speak casually like a trusted coach. Help clarify goals, break tasks into micro-steps, stay accountable. Keep responses short, supportive, and give clear next steps."
)


def get_vida_response(user_prompt: str) -> str:
    """Return Vida's response to the given user prompt."""
    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": SYSTEM_MESSAGE},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        return completion.choices[0].message.content
    except AuthenticationError:
        return "Authentication failed when communicating with OpenAI."
    except Exception:
        return "An unexpected error occurred while generating the response."
