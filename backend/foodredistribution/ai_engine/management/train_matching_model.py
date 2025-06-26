from django.core.management.base import BaseCommand
from foodredistribution.ai_engine.matching_engine import matching_engine

class Command(BaseCommand):
    help = 'Train the AI matching model from existing feedback data'
    
    def handle(self, *args, **options):
        self.stdout.write('Starting model training...')
        
        success = matching_engine.train_model_from_feedback()
        
        if success:
            self.stdout.write(
                self.style.SUCCESS('Model training completed successfully')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Model training failed or insufficient data')
            )