"""Tests for the prompt assembly service."""

import os
import sys

# Notes: Ensure project modules are importable and env vars set
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault("OPENAI_API_KEY", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from services.prompt_assembly_service import build_agent_prompt


# Verify system message and memory injection for a health agent

def test_build_agent_prompt_health():
    memory = "Past notes"
    user_prompt = "How do I stay healthy?"
    messages = build_agent_prompt("health", memory, user_prompt)
    assert messages[0]["role"] == "system"
    assert "wellness coach" in messages[0]["content"]
    assert messages[1] == {"role": "system", "content": memory}
    assert messages[-1] == {"role": "user", "content": user_prompt}


# Verify that empty memory is omitted from the payload

def test_build_agent_prompt_no_memory():
    messages = build_agent_prompt("finance", "", "Advice")
    assert len(messages) == 2
    assert messages[0]["role"] == "system"
    assert messages[1] == {"role": "user", "content": "Advice"}

# Footnote: Ensures prompt assembly correctly injects persona and optional memory.
