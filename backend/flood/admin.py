from django.contrib import admin
from .models import (
    Location, FloodZone, Road, DrainageSegment, ElevationCell,
    RainfallObservation, WeatherForecast, PredictionRun, FloodPrediction, FloodEvent
)

@admin.register(FloodZone)
class FloodZoneAdmin(admin.ModelAdmin):
    list_display = ('zone_id', 'name', 'ward', 'elevation_m', 'base_risk')
    search_fields = ('name', 'zone_id', 'ward')

@admin.register(Road)
class RoadAdmin(admin.ModelAdmin):
    list_display = ('road_id', 'name', 'start_node', 'end_node', 'length_km', 'is_underpass')
    list_filter = ('is_underpass', 'road_type')

@admin.register(DrainageSegment)
class DrainageSegmentAdmin(admin.ModelAdmin):
    list_display = ('drain_id', 'name', 'capacity_m3s', 'effective_capacity_m3s', 'critical_status')

@admin.register(FloodEvent)
class FloodEventAdmin(admin.ModelAdmin):
    list_display = ('event_id', 'event_name', 'date', 'peak_rainfall_mm_24h', 'peak_depth_cm')
