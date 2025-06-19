"""Runtime loader for agent plugins."""

from __future__ import annotations

import importlib
import pkgutil
import os
from typing import Dict, Type

from agents.base import BaseAgent
from utils.logger import get_logger

logger = get_logger()

# Registry of discovered agent classes
REGISTERED_AGENTS: Dict[str, Type[BaseAgent]] = {}


def discover_agents() -> None:
    """Populate ``REGISTERED_AGENTS`` by scanning the agents package."""

    for module_info in pkgutil.iter_modules(["agents"]):
        module_name = module_info.name
        try:
            module = importlib.import_module(f"agents.{module_name}")
        except Exception as exc:  # pragma: no cover - import errors logged
            logger.error("Failed to import agent module %s: %s", module_name, exc)
            continue
        for attr in dir(module):
            obj = getattr(module, attr)
            if (
                isinstance(obj, type)
                and issubclass(obj, BaseAgent)
                and obj is not BaseAgent
            ):
                REGISTERED_AGENTS[obj.agent_name()] = obj


def load_plugins(agent_names: list[str] | None = None) -> Dict[str, BaseAgent]:
    """Instantiate and return configured agent plugins."""

    if not REGISTERED_AGENTS:
        discover_agents()

    loaded: Dict[str, BaseAgent] = {}
    names = agent_names or list(REGISTERED_AGENTS.keys())
    # Notes: include MockAgent automatically when running tests
    if os.getenv("TESTING") == "true" and "mock" in REGISTERED_AGENTS:
        if "mock" not in names:
            names.append("mock")
    for name in names:
        cls = REGISTERED_AGENTS.get(name)
        if not cls:
            logger.warning("Agent %s not found during plugin load", name)
            continue
        try:
            loaded[name] = cls()
        except Exception as exc:  # pragma: no cover - plugin failure
            logger.error("Failed to instantiate agent %s: %s", name, exc)
    return loaded
