from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()
    elevation = models.FloatField(default=210.0, help_text="Elevation in meters ASL")
    ward = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.latitude}, {self.longitude})"

class FloodZone(models.Model):
    zone_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    ward = models.CharField(max_length=100)
    elevation_m = models.FloatField()
    slope_pct = models.FloatField(default=0.5)
    impervious_pct = models.FloatField(default=85.0)
    drainage_id = models.CharField(max_length=100, blank=True)
    drainage_capacity_m3s = models.FloatField(default=20.0)
    historical_flood_freq = models.FloatField(default=0.5)
    base_risk = models.CharField(max_length=20, default="MODERATE")
    soil_type = models.CharField(max_length=100, default="Alluvial Loam")
    polygon_geojson = models.JSONField(help_text="GeoJSON Polygon Geometry")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.base_risk}"

class Road(models.Model):
    road_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    start_node = models.CharField(max_length=50)
    end_node = models.CharField(max_length=50)
    road_type = models.CharField(max_length=50, default="Primary Arterial")
    lanes = models.IntegerField(default=4)
    length_km = models.FloatField(default=1.0)
    speed_kmh = models.IntegerField(default=50)
    base_elevation_m = models.FloatField(default=210.0)
    is_underpass = models.BooleanField(default=False)
    critical_evac_route = models.BooleanField(default=True)
    geometry_geojson = models.JSONField(help_text="GeoJSON LineString Geometry")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.length_km} km)"

class DrainageSegment(models.Model):
    drain_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    drain_type = models.CharField(max_length=50, default="Primary Storm Trunk")
    capacity_m3s = models.FloatField()
    effective_capacity_m3s = models.FloatField()
    width_m = models.FloatField(default=10.0)
    slope_pct = models.FloatField(default=0.05)
    siltation_pct = models.FloatField(default=30.0)
    outfall = models.CharField(max_length=200, blank=True)
    critical_status = models.CharField(max_length=50, default="MONITORED")
    geometry_geojson = models.JSONField(help_text="GeoJSON LineString Geometry")

    def __str__(self):
        return f"{self.name} ({self.effective_capacity_m3s} m3/s)"

class ElevationCell(models.Model):
    grid_id = models.CharField(max_length=50, unique=True)
    col = models.IntegerField()
    row = models.IntegerField()
    elevation_m = models.FloatField()
    slope_pct = models.FloatField(default=0.5)
    impervious_pct = models.FloatField(default=80.0)
    drainage_eff_pct = models.FloatField(default=70.0)
    basin = models.CharField(max_length=100, blank=True)
    polygon_geojson = models.JSONField()

    def __str__(self):
        return f"Cell {self.grid_id} ({self.elevation_m}m)"

class RainfallObservation(models.Model):
    station_name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    intensity_mm_per_hr = models.FloatField()
    cumulative_3h_mm = models.FloatField()
    previous_24h_mm = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

class WeatherForecast(models.Model):
    city = models.CharField(max_length=100, default="Delhi NCR")
    current_temp_c = models.FloatField(default=29.0)
    current_humidity_pct = models.FloatField(default=92.0)
    current_rainfall_mm_hr = models.FloatField(default=48.5)
    forecast_1h_mm_hr = models.FloatField(default=62.0)
    forecast_3h_mm_hr = models.FloatField(default=35.0)
    radar_storm_direction = models.CharField(max_length=50, default="North-East (35 km/h)")
    monsoon_alert_level = models.CharField(max_length=20, default="ORANGE")
    updated_at = models.DateTimeField(auto_now=True)

class PredictionRun(models.Model):
    run_id = models.CharField(max_length=100, unique=True)
    model_version = models.CharField(max_length=50)
    rainfall_input_mm_hr = models.FloatField()
    city_risk_score = models.FloatField()
    high_risk_zones_count = models.IntegerField()
    max_predicted_depth_cm = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

class FloodPrediction(models.Model):
    run = models.ForeignKey(PredictionRun, on_delete=models.CASCADE, related_name="predictions", null=True, blank=True)
    zone = models.ForeignKey(FloodZone, on_delete=models.CASCADE)
    time_horizon = models.CharField(max_length=20, default="NOW")
    risk_class = models.CharField(max_length=20)
    flood_probability = models.FloatField()
    predicted_water_depth_cm = models.FloatField()
    depth_category = models.CharField(max_length=100)
    confidence = models.FloatField(default=0.92)
    contributing_factors = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

class FloodEvent(models.Model):
    event_id = models.CharField(max_length=100, unique=True)
    event_name = models.CharField(max_length=200)
    date = models.DateField()
    peak_rainfall_mm_24h = models.FloatField()
    peak_depth_cm = models.FloatField()
    primary_causes = models.JSONField(default=list)
    severely_affected_areas = models.JSONField(default=list)
    economic_impact_cr = models.FloatField(default=0.0)
    evacuations_count = models.IntegerField(default=0)
