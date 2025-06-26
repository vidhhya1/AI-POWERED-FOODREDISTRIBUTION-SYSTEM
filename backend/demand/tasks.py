from celery import shared_task

@shared_task
def retrain_demand_models():
    from .utils import train_and_save_models  # lazy import
    train_and_save_models()
    return "Retrained demand prediction models" # using Prophet for each city"
# This task can be scheduled to run weekly using Celery Beat or any other scheduler.