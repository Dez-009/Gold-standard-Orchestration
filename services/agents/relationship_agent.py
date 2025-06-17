"""Agent processor providing relationship coaching responses."""

# Notes: Import OpenAI client for relationship advice
from openai import OpenAI
from config import get_settings

# Notes: Initialize OpenAI client using the app API key
client = OpenAI(api_key=get_settings().openai_api_key)


# Notes: Generate a response from the relationship agent

def process(user_prompt: str) -> str:
    """Return the relationship agent's reply to the user prompt."""
    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a compassionate relationship coach."},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=512,
        )
        return completion.choices[0].message.content
    except Exception:
        return "Relationship agent failed to generate a response."
