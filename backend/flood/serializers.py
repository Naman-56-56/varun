from rest_framework import serializers
from .models import (
    Location, FloodZone, Road, DrainageSegment, ElevationCell,
    RainfallObservation, WeatherForecast, PredictionRun, FloodPrediction, FloodEvent
)

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class FloodZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = FloodZone
        fields = '__all__'

class RoadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Road
        fields = '__all__'

class DrainageSegmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DrainageSegment
        fields = '__all__'

class ElevationCellSerializer(serializers.ModelSerializer):
    class Meta:
        model = ElevationCell
        fields = '__all__'

class WeatherForecastSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherForecast
        fields = '__all__'

class RainfallObservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = RainfallObservation
        fields = '__all__'

class FloodPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FloodPrediction
        fields = '__all__'

class FloodEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = FloodEvent
        fields = '__all__'
