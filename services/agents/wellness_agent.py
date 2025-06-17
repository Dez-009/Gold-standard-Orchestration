"""Agent processor providing wellness coaching responses."""

# Notes: Import OpenAI client for wellness advice
from openai import OpenAI
from config import get_settings

# Notes: Initialize OpenAI client with API key from settings
client = OpenAI(api_key=get_settings().openai_api_key)


# Notes: Generate a response from the wellness agent using pre-built messages

def process(messages: list[dict[str, str]]) -> str:
    """Return the wellness agent's reply to the assembled prompt messages."""

    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=512,
        )
        return completion.choices[0].message.content
    except Exception:
        return "Wellness agent failed to generate a response."
