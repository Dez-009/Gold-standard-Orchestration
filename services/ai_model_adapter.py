"""Abstraction layer for interacting with different AI model providers."""

# Notes: Import OpenAI SDK and application settings helper
from openai import OpenAI
from config import get_settings


# Notes: Simple stub representing an Anthropic Claude client
class AnthropicClient:
    """Placeholder client for Claude API interactions."""

    def generate(self, messages: list[dict[str, str]], temperature: float = 0.7) -> str:
        return "[Stubbed Claude response]"


# Notes: Simple stub representing a local language model client
class LocalLLMClient:
    """Placeholder client for running a local language model."""

    def generate(self, messages: list[dict[str, str]], temperature: float = 0.7) -> str:
        return "[Stubbed Local LLM response]"


# Notes: Wrapper client for OpenAI to keep a consistent generate() interface
class OpenAIClient:
    """Thin wrapper around the OpenAI chat completion API."""

    def __init__(self) -> None:
        # Notes: Initialize the underlying OpenAI client using API key from settings
        self._client = OpenAI(api_key=get_settings().openai_api_key)

    def generate(self, messages: list[dict[str, str]], temperature: float = 0.7) -> str:
        """Return the text content from an OpenAI chat completion."""
        completion = self._client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=temperature,
            max_tokens=1024,
        )
        return completion.choices[0].message.content


# Notes: Main adapter class that hides the underlying provider implementations
class AIModelAdapter:
    """Adapter used by the application to interact with different AI providers."""

    def __init__(self, provider: str) -> None:
        self.provider = provider
        # Notes: Instantiate the appropriate client based on the provider name
        self.client = self._initialize_client()

    def _initialize_client(self):
        """Return the client object for the configured provider."""
        if self.provider == "OpenAI":
            return OpenAIClient()
        if self.provider == "Claude":
            return AnthropicClient()
        if self.provider == "LocalLLM":
            return LocalLLMClient()
        raise ValueError("Unsupported provider specified")

    def generate(self, messages: list[dict[str, str]], temperature: float = 0.7) -> str:
        """Delegate the generation call to the underlying client."""
        return self.client.generate(messages, temperature)
