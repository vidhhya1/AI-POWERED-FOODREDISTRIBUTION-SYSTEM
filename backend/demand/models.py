from django.db import models
from django.contrib.auth import get_user_model

CustomUser = get_user_model()

class DemandDataPoint(models.Model):
    city = models.CharField(max_length=100)
    date = models.DateField()
    donation_volume = models.PositiveIntegerField()
    request_volume = models.PositiveIntegerField()
    special_event = models.CharField(max_length=255, blank=True, null=True)
    submitted_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='demand_data')

    def __str__(self):
        return f"{self.city} - {self.date}"
