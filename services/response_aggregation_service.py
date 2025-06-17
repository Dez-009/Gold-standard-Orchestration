"""Service for combining multiple agent replies into one summary."""

# Notes: typing import for agent response dictionaries
from typing import Dict


# Notes: Build a formatted summary string from agent outputs

def aggregate_agent_responses(agent_responses: Dict[str, str]) -> str:
    """Return a single text summary combining all agent responses."""

    # Notes: Start with a consistent title heading
    sections: list[str] = ["Vida Coach Multi-Agent Summary"]

    # Notes: Iterate through each response and add a labeled section
    for agent_type, response in agent_responses.items():
        if not response:
            # Notes: Skip empty responses
            continue
        sections.append("")
        sections.append(f"### {agent_type}")
        sections.append(response.strip())

    # Notes: Join all sections with newline characters
    return "\n".join(sections)

# Footnote: Combines multi-agent responses into unified coaching summary for user display.
