from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
import logging
from datetime import timedelta
from django.utils import timezone

logger = logging.getLogger(__name__)

def send_notification_email(subject, context, recipient_list):
    try:
        html_content = render_to_string('emails/notification.html', context)
        text_content = render_to_string('emails/notification.txt', context)  # optional plain text fallback

        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=None,  # uses DEFAULT_FROM_EMAIL from settings
            to=recipient_list,
        )
        email.attach_alternative(html_content, "text/html")
        email.send()
        logger.info(f"Notification email sent to {recipient_list}")

    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        print(f"Failed to send email: {e}")

def detect_cancellation_anomaly(user, threshold=3, days=30):
    """
    Returns True if the user has cancelled more than threshold donations in the last days days.
    """
    from .models import FoodDonation
    since = timezone.now() - timedelta(days=days)
    cancelled_count = FoodDonation.objects.filter(
        donor=user,
        status='cancelled',
        updated_at__gte=since
    ).count()
    return cancelled_count > threshold