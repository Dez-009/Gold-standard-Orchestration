"""Unit tests for the SMS sender utility."""

# Notes: Configure import path for access to project modules
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Notes: Import the SMS sending function
from services.notifications.sms_sender import send_sms


# Notes: Ensure send_sms prints the expected content

def test_send_sms(capsys):
    """send_sms should print the phone number and message."""
    send_sms("1234567890", "ping")
    captured = capsys.readouterr()
    assert "SMS to 1234567890: ping" in captured.out
