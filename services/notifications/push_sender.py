# Notes: Basic push notification sender

# Notes: Uses stdout to simulate push delivery for now

def send_push(user_id: str, message: str) -> None:
    """Send a push notification to the specified user."""
    # Notes: Print the push payload to mimic delivery
    print(f"Push to {user_id}: {message}")
