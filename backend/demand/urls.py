from django.urls import path
from .views import demand_forecast_api, submit_demand_data

urlpatterns = [
    path('forecast/', demand_forecast_api),
    path('submit/', submit_demand_data),  # ✅ New endpoint
]