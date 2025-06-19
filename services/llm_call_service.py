"""Service for calling the configured LLM provider."""

from __future__ import annotations

# Notes: Import OpenAI SDK and application settings loader
from openai import OpenAI, AuthenticationError
from config import get_settings


# Notes: Initialize the OpenAI client with API key from settings
_client = OpenAI(api_key=get_settings().openai_api_key)


def call_llm(prompt_payload: list[dict[str, str]]) -> str:
    """Return the text response from the language model."""

    # Notes: Send the payload to the chat completion endpoint
    try:
        completion = _client.chat.completions.create(
            model="gpt-4o",
            messages=prompt_payload,
            temperature=0.7,
            max_tokens=1024,
        )
        # Notes: Extract and return the first choice text
        return completion.choices[0].message.content
    except AuthenticationError:
        return "Authentication failed when communicating with OpenAI."
    except Exception:
        return "An unexpected error occurred while generating the response."

# Footnote: Decouples LLM model invocation from orchestration loop for modular upgrades.
