from __future__ import annotations

"""Mock agent for use in test mode."""

from agents.base import BaseAgent


class MockAgent(BaseAgent):
    """Agent returning predictable strings for tests."""

    name = "mock"

    async def run(self, *args, **kwargs) -> str:
        task = kwargs.get("task", "summary")
        if task == "summary":
            return "Mock summary"
        if task == "goal":
            return "Mock goal"
        return "Mock response"

