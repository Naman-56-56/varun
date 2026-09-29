import random
from datetime import datetime

class WeatherDataProvider:
    """
    Abstracted Weather & Rainfall Data Provider for Delhi NCR.
    Provides live observation feeds, radar rainfall snapshots, and multi-hour forecasts.
    """
    def __init__(self):
        self.base_intensity = 48.5
        
    def get_current_weather(self):
        return {
            "city": "Delhi NCR",
            "station": "Safdarjung IMD Meteorological Observatory",
            "timestamp": datetime.now().isoformat(),
            "temperature_c": 28.5,
            "humidity_pct": 94,
            "rainfall_intensity_mm_hr": self.base_intensity,
            "cumulative_3h_mm": 82.4,
            "previous_24h_mm": 115.0,
            "pressure_hpa": 998.2,
            "wind_speed_kmh": 22.0,
            "wind_direction": "ENE",
            "radar_cloud_top_km": 11.5,
            "monsoon_alert": "ORANGE_WARNING",
            "advisory": "Intense convective rainstorm cells advancing across Central and Trans-Yamuna corridors."
        }

    def get_rainfall_grid_stations(self):
        """
        Returns spatial rainfall telemetry across Delhi's primary weather stations.
        """
        stations = [
            {"id": "STN_SAFDARJUNG", "name": "Safdarjung IMD", "lat": 28.5840, "lng": 77.2060, "intensity_mm_hr": 52.0, "status": "ACTIVE"},
            {"id": "STN_PALAM", "name": "Palam Airport AWS", "lat": 28.5665, "lng": 77.1031, "intensity_mm_hr": 44.5, "status": "ACTIVE"},
            {"id": "STN_LODHI", "name": "Lodhi Road", "lat": 28.5910, "lng": 77.2270, "intensity_mm_hr": 58.0, "status": "ACTIVE"},
            {"id": "STN_RIDGE", "name": "Delhi University Ridge", "lat": 28.6920, "lng": 77.2110, "intensity_mm_hr": 42.0, "status": "ACTIVE"},
            {"id": "STN_AYANAGAR", "name": "Ayanagar South", "lat": 28.4720, "lng": 77.1270, "intensity_mm_hr": 38.0, "status": "ACTIVE"},
            {"id": "STN_MAYUR_VIHAR", "name": "Mayur Vihar AWS", "lat": 28.6010, "lng": 77.2990, "intensity_mm_hr": 64.0, "status": "CRITICAL"}
        ]
        return stations

    def get_forecast_timeseries(self):
        return [
            {"time": "NOW", "rainfall_mm_hr": 48.5, "prob_storm_pct": 95},
            {"time": "+30m", "rainfall_mm_hr": 65.0, "prob_storm_pct": 98},
            {"time": "+60m", "rainfall_mm_hr": 78.5, "prob_storm_pct": 90},
            {"time": "+90m", "rainfall_mm_hr": 54.0, "prob_storm_pct": 80},
            {"time": "+120m", "rainfall_mm_hr": 32.0, "prob_storm_pct": 65},
            {"time": "+150m", "rainfall_mm_hr": 18.0, "prob_storm_pct": 45},
            {"time": "+180m", "rainfall_mm_hr": 8.5, "prob_storm_pct": 25}
        ]

weather_provider = WeatherDataProvider()
