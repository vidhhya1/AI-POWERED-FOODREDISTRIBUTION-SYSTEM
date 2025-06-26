from django.core.management.base import BaseCommand
from demand.utils import train_and_save_models

class Command(BaseCommand):
    help = "Retrains demand prediction models using Prophet for each city"

    def handle(self, *args, **kwargs):
        self.stdout.write("🔁 Starting weekly demand model retraining...")
        train_and_save_models()
        self.stdout.write("✅ Model retraining completed successfully.")
