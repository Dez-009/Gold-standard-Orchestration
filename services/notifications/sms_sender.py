# Notes: Function for sending SMS notifications

# Notes: This implementation simply prints the message to stdout

def send_sms(to_number: str, message: str) -> None:
    """Send an SMS notification to the provided number."""
    # Notes: Print output to mimic SMS delivery
    print(f"SMS to {to_number}: {message}")
