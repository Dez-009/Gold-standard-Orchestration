"""Unit tests for the email sender utility."""

# Notes: Adjust import path and environment variables for the test environment
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Notes: Import the function under test
from services.notifications.email_sender import send_email


# Notes: Validate that send_email outputs the expected text

def test_send_email(capsys):
    """send_email should print the destination and message."""
    send_email("test@example.com", "hello")
    captured = capsys.readouterr()
    assert "Email to test@example.com: hello" in captured.out
