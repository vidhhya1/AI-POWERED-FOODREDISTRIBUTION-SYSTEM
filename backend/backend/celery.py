from __future__ import absolute_import
import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'retrain-demand-models-every-day': {
        'task': 'demand.tasks.retrain_demand_models',
        'schedule': crontab(hour=0, minute=0),
    },
} 
app.conf.beat_schedule.update({
    'send-pickup-reminders-every-30-minutes': {
        'task': 'foodredistribution.tasks.send_pickup_reminders',
        'schedule': crontab(minute='*/30'),  # every 30 mins
    },
    'send-feedback-reminders-every-hour': {
        'task': 'foodredistribution.tasks.send_feedback_reminders',
        'schedule': crontab(minute=0, hour='*'),  # every hour
    },
})

