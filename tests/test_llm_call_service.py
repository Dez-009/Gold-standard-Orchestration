"""Tests for the llm_call_service utility."""

import os
import sys

# Notes: Ensure project modules are importable and env vars set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services import llm_call_service


# Verify that prompt payload is submitted to the adapter

def test_call_llm(monkeypatch):
    called = {}

    # Notes: Patch the OpenAI client to confirm the payload is forwarded
    class FakeOpenAI:
        def __init__(self, *_, **__):
            pass

        class chat:
            class completions:
                @staticmethod
                def create(model, messages, temperature=0.7, max_tokens=1024):
                    called['messages'] = messages
                    return type('Obj', (), {'choices': [type('C', (), {'message': type('M', (), {'content': "ok"})()})]})()

    monkeypatch.setattr(llm_call_service, 'OpenAI', FakeOpenAI)
    monkeypatch.setattr(llm_call_service, '_client', FakeOpenAI())

    response = llm_call_service.call_llm([{"role": "user", "content": "hi"}])
    assert called['messages'][0]["content"] == "hi"
    assert response == "ok"

# Footnote: Validates LLM invocation wrapper behavior.
