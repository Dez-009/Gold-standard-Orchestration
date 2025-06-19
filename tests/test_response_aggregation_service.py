"""Unit tests for the response aggregation service."""

# Notes: Set up path and environment for imports
import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Notes: Import the function under test
from services.response_aggregation_service import aggregate_agent_responses


# Notes: Validate that multiple agent responses are formatted correctly

def test_aggregate_basic():
    responses = {"career": "Do this", "finance": {"content": "Save money"}}
    result = aggregate_agent_responses(responses)
    assert result.startswith("Vida Coach Multi-Agent Summary")
    assert "### career" in result
    assert "Do this" in result
    assert "### finance" in result
    assert "Save money" in result


# Notes: Ensure agent labels are preserved exactly as provided

def test_aggregate_preserves_agent_keys():
    responses = {"health": "Stay fit"}
    result = aggregate_agent_responses(responses)
    assert "### health" in result


# Notes: Verify that empty responses are omitted from the final output

def test_aggregate_skips_empty():
    responses = {"career": {"content": ""}, "finance": "Plan budget"}
    result = aggregate_agent_responses(responses)
    assert "### career" not in result
    assert "### finance" in result
    assert "Plan budget" in result


# Notes: Confirm dict structure with status field is accepted
def test_aggregate_supports_dict_objects():
    responses = {"career": {"status": "timeout", "content": "waiting"}}
    result = aggregate_agent_responses(responses)
    assert "waiting" in result
