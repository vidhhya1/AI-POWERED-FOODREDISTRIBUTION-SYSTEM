from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .utils import forecast_demand
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import DemandDataPoint
from .serializers import DemandDataPointSerializer 

@api_view(['GET'])
def demand_forecast_api(request):
    city = request.GET.get('city', 'Indore')
    days = int(request.GET.get('days', 7))

    forecast = forecast_demand(city, days)

    # ✅ FIXED check
    if forecast is None or forecast.empty:
        return Response({'error': 'Model not found or no data available'}, status=404)

    return Response(forecast.to_dict(orient='records'))


@api_view(['GET'])
def demand_forecast_api(request):
    city = request.GET.get('city', 'Indore')
    days = int(request.GET.get('days', 7))
   
    forecast = forecast_demand(city, days)

    # ✅ FIXED check
    if forecast is None or forecast.empty:
        return Response({'error': 'Model not found or no data available'}, status=404)

    return Response(forecast.to_dict(orient='records')) 
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_demand_data(request):
    serializer = DemandDataPointSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(submitted_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)