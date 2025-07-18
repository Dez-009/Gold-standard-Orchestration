"""Agent processor providing career coaching responses."""

# Notes: Import OpenAI client for generating career advice
from openai import OpenAI
from config import get_settings

# Notes: Initialize the OpenAI client using the configured API key
client = OpenAI(api_key=get_settings().openai_api_key)


# Notes: Generate a response from the career agent using pre-built messages

def process(messages: list[dict[str, str]]) -> str:
    """Return the career agent's reply to the assembled prompt messages."""

    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            max_tokens=512,
        )
        return completion.choices[0].message.content
    except Exception:
        return "Career agent failed to generate a response."
