"""Agent detecting tension and suggesting conflict resolution prompts."""

from __future__ import annotations

# Notes: Import regex for keyword matching
import re

# Notes: Import the conflict flag model and enumeration
from models.conflict_flag import ConflictFlag, ConflictType

# Notes: Import the shared AI model adapter
from services.ai_model_adapter import AIModelAdapter

# Notes: Instantiate the adapter using the default provider
adapter = AIModelAdapter("OpenAI")

# Notes: Keyword patterns that often signal conflict or tension
CONFLICT_PATTERNS = [
    re.compile(r"\bargu(ed|ing)?\b", re.I),
    re.compile(r"\bconflict\b", re.I),
    re.compile(r"\bfight(ing)?\b", re.I),
    re.compile(r"\bdisagree(d|ment)?\b", re.I),
    re.compile(r"stuck between", re.I),
]


# Notes: Analyze journal text and return any detected conflict flags

def detect_conflict_issues(journal_text: str) -> list[ConflictFlag]:
    """Return potential conflict flags with follow-up prompts."""

    flags: list[ConflictFlag] = []

    # Notes: Quick heuristic scan for conflict keywords
    if not any(p.search(journal_text) for p in CONFLICT_PATTERNS):
        return flags

    # Notes: Ask the language model to classify the conflict type and offer advice
    response = adapter.generate(
        [
            {
                "role": "system",
                "content": (
                    "You are a compassionate mediator helping users reflect on challenges. "
                    "Classify the main conflict as emotional, relational, work, or values and "
                    "provide one short piece of advice or a question to help them resolve it."
                ),
            },
            {"role": "user", "content": journal_text},
        ],
        temperature=0.5,
    )

    # Notes: Attempt to parse the model response for type and advice
    conflict_type = ConflictType.EMOTIONAL
    advice = response.strip()
    lowered = response.lower()
    if "work" in lowered:
        conflict_type = ConflictType.WORK
    elif "relationship" in lowered or "relational" in lowered:
        conflict_type = ConflictType.RELATIONAL
    elif "value" in lowered:
        conflict_type = ConflictType.VALUES

    # Notes: Build the conflict flag object using the excerpt and advice
    excerpt = journal_text[:120]
    flag = ConflictFlag(
        conflict_type=conflict_type,
        summary_excerpt=excerpt,
        resolution_prompt=advice,
    )
    flags.append(flag)

    return flags

# Footnote: This agent is invoked after journals are summarized.
