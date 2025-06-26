from rest_framework import serializers
from .models import DemandDataPoint

class DemandDataPointSerializer(serializers.ModelSerializer):
    class Meta:
        model = DemandDataPoint
        fields = '__all__'
        read_only_fields = ['submitted_by']
