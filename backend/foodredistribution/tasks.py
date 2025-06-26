from celery import shared_task
from django.utils.timezone import now, localtime, timedelta
from .models import ClaimedDonation
from .utils import send_notification_email  # 👈 Import your custom function 

@shared_task
def notify_fallback_receivers_task(donation_id):
    from .models import FoodDonation, CustomUser
    from .utils import send_notification_email

    donation = FoodDonation.objects.filter(id=donation_id, status='pending').first()
    if not donation or donation.claims.exists():
        return

    receivers = CustomUser.objects.filter(is_requester=True)

    for receiver in receivers:
        context = {
                "donor": donation.donor.username,
                "category": donation.category.name,
                "quantity": donation.quantity,
                "location": {
                    "city": donation.location.city,
                    "state": donation.location.state,
                    "zipcode": donation.location.zipcode,
                },
                "description": donation.description,
                "expiry_date": donation.expiry_date.strftime("%Y-%m-%d %H:%M") if donation.expiry_date else None,
            }

        send_notification_email(
            subject="🔔 Unclaimed Food Donation Available!",
            context=context,
            recipient_list=[receiver.email]
        )

@shared_task
def send_pickup_reminders():
    upcoming = ClaimedDonation.objects.filter(
        donation_expiry_date_lte=now() + timedelta(hours=2),
        donation_expiry_date_gte=now()
    )

    for claim in upcoming:
        context = {
            'username': claim.claimed_by.username,
            'description': claim.donation.description,
            'location': claim.donation.location,
            'expiry': localtime(claim.donation.expiry_date).strftime('%Y-%m-%d %H:%M')
        }
        subject = "Reminder: Pickup Your Food Donation"
        recipient_list = [claim.claimed_by.email]

        send_notification_email(subject, context, recipient_list)

@shared_task
def send_feedback_reminders():
    past = ClaimedDonation.objects.filter(
        claim_date__lte=now() - timedelta(hours=2)
    ).exclude(feedback__isnull=False)

    for claim in past:
        context = {
            'username': claim.claimed_by.username,
            'description': claim.donation.description
        }
        subject = "Reminder: Submit Feedback"
        recipient_list = [claim.claimed_by.email]

        send_notification_email(subject, context, recipient_list)
# This task will run periodically to send reminders for pickup and feedback
# You can configure the periodicity in your Celery beat schedule