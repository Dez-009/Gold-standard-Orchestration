"""Agent processor providing mindset coaching responses."""

# Notes: Import OpenAI client for mindset guidance
from openai import OpenAI
from config import get_settings

# Notes: Initialize OpenAI client using the API key from settings
client = OpenAI(api_key=get_settings().openai_api_key)


# Notes: Generate a response from the mindset agent using pre-built messages

def process(messages: list[dict[str, str]]) -> str:
    """Return the mindset agent's reply to the assembled prompt messages."""

    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=512,
        )
        return completion.choices[0].message.content
    except Exception:
        return "Mindset agent failed to generate a response."
