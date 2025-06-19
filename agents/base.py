from __future__ import annotations

"""Base class for pluggable agents."""

class BaseAgent:
    """Simple async agent interface."""

    name: str = "base"

    async def run(self, *args, **kwargs) -> str:
        raise NotImplementedError

    @classmethod
    def agent_name(cls) -> str:
        return getattr(cls, "name", cls.__name__)
