# Notes: Routing logic for delivering notifications via different channels

from models.notification import Notification
from .email_sender import send_email
from .sms_sender import send_sms
from .push_sender import send_push


# Notes: Dispatch the notification to the appropriate sender based on channel

def deliver_notification(notification: Notification) -> None:
    """Send the notification using the specified delivery channel."""
    user = notification.user

    if notification.channel == "email":
        # Notes: Route to the email sender utility
        send_email(user.email, notification.message)
    elif notification.channel == "sms":
        # Notes: Route to the SMS sender utility
        send_sms(user.phone_number, notification.message)
    else:
        # Notes: Default to push notification delivery
        send_push(str(user.id), notification.message)
