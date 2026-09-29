import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "rainfall_intensity",
    "cumulative_3h_rain",
    "previous_24h_rain",
    "forecast_next_1h",
    "elevation",
    "slope_pct",
    "impervious_pct",
    "distance_to_drain_m",
    "drainage_capacity_m3s",
    "drainage_siltation_pct",
    "effective_drainage_cap",
    "historical_flood_freq",
    "soil_saturation_index",
    "is_underpass"
]

RISK_CLASS_MAPPING = {
    0: "LOW",
    1: "MODERATE",
    2: "HIGH",
    3: "CRITICAL"
}

RISK_CLASS_TO_INT = {v: k for k, v in RISK_CLASS_MAPPING.items()}

def extract_features_from_zone_and_weather(zone_props, weather_data, is_underpass=False):
    """
    Transforms geospatial zone metadata and dynamic weather readings into a standard ML feature vector.
    """
    rain_int = float(weather_data.get("rainfall_intensity", 35.0))
    cum_3h = float(weather_data.get("cumulative_3h_rain", rain_int * 1.8))
    prev_24h = float(weather_data.get("previous_24h_rain", 20.0))
    fc_1h = float(weather_data.get("forecast_next_1h", rain_int * 1.1))
    
    elevation = float(zone_props.get("elevation_m", 210.0))
    slope = float(zone_props.get("slope_pct", 0.5))
    impervious = float(zone_props.get("impervious_pct", 85.0))
    dist_drain = float(zone_props.get("distance_to_drain_m", 80.0))
    drain_cap = float(zone_props.get("drainage_capacity_m3s", 25.0))
    siltation = float(zone_props.get("drainage_siltation_pct", 35.0))
    effective_cap = drain_cap * (1.0 - siltation / 100.0)
    hist_freq = float(zone_props.get("historical_flood_freq", 0.75))
    
    soil_sat = min(1.0, max(0.1, prev_24h / 80.0 + (225.0 - elevation) / 100.0))
    underpass = 1 if (is_underpass or "underpass" in str(zone_props.get("name", "")).lower()) else 0
    
    return {
        "rainfall_intensity": rain_int,
        "cumulative_3h_rain": cum_3h,
        "previous_24h_rain": prev_24h,
        "forecast_next_1h": fc_1h,
        "elevation": elevation,
        "slope_pct": slope,
        "impervious_pct": impervious,
        "distance_to_drain_m": dist_drain,
        "drainage_capacity_m3s": drain_cap,
        "drainage_siltation_pct": siltation,
        "effective_drainage_cap": effective_cap,
        "historical_flood_freq": hist_freq,
        "soil_saturation_index": soil_sat,
        "is_underpass": underpass
    }
