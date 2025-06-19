# Notes: Provide a simple function to deliver email notifications

# Notes: This stub only prints the message but could integrate with an email API

def send_email(to_address: str, message: str) -> None:
    """Send an email notification to the given address."""
    # Notes: Output to stdout to simulate delivery
    print(f"Email to {to_address}: {message}")
