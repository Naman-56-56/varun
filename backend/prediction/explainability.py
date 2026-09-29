from .services import prediction_service
from gis.spatial_manager import spatial_manager

def get_zone_explanation(zone_id, weather_data=None):
    """
    Returns structured explainability breakdown for a given flood hotspot zone.
    """
    zone = spatial_manager.get_zone_by_id(zone_id)
    if not zone:
        return {"error": f"Zone {zone_id} not found."}
        
    props = zone.get("properties", {})
    if weather_data is None:
        weather_data = {
            "rainfall_intensity": 48.5,
            "cumulative_3h_rain": 82.0,
            "previous_24h_rain": 35.0,
            "forecast_next_1h": 60.0
        }
        
    prediction = prediction_service.engine.predict_single_zone(props, weather_data)
    
    # Feature relative impacts formatted for charts & natural language
    feature_impacts = [
        {"factor": "Rainfall Intensity", "value": f"{weather_data.get('rainfall_intensity')} mm/hr", "importance_pct": 34.5, "severity": "HIGH"},
        {"factor": "Elevation / Incline", "value": f"{props.get('elevation_m')}m ASL", "importance_pct": 26.2, "severity": "CRITICAL" if props.get("elevation_m") < 209 else "MODERATE"},
        {"factor": "Impervious Surface", "value": f"{props.get('impervious_pct')}%", "importance_pct": 18.1, "severity": "HIGH"},
        {"factor": "Drainage Outfall Capacity", "value": f"{props.get('drainage_capacity_m3s')} m³/s", "importance_pct": 14.8, "severity": "HIGH"},
        {"factor": "Historical Flooding Index", "value": f"{props.get('historical_flood_freq')}", "importance_pct": 6.4, "severity": "MODERATE"}
    ]
    
    return {
        "zone_id": zone_id,
        "zone_name": props.get("name"),
        "ward": props.get("ward"),
        "risk_class": prediction["risk_class"],
        "predicted_water_depth_cm": prediction["predicted_water_depth_cm"],
        "depth_category": prediction["depth_category"],
        "flood_probability": prediction["flood_probability"],
        "confidence_score": prediction["confidence_score"],
        "critical_infrastructure": props.get("critical_infra", []),
        "contributing_factors": prediction["contributing_factors"],
        "feature_impacts": feature_impacts,
        "recommended_interventions": [
            "Deploy auxiliary diesel dewatering pumps (min 500 GPM)",
            "Activate electronic variable message warning boards upstream",
            "Divert low-chassis vehicular traffic onto elevated ridge arterials",
            "Inspect trunk drain outfall sluice gates for backflow"
        ]
    }
