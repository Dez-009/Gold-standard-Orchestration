"""Unit tests for the push sender utility."""

# Notes: Modify import path so the project modules are available
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Notes: Import the push sending helper
from services.notifications.push_sender import send_push


# Notes: Ensure send_push prints the correct output

def test_send_push(capsys):
    """send_push should print the user id and message."""
    send_push("42", "alert")
    captured = capsys.readouterr()
    assert "Push to 42: alert" in captured.out
