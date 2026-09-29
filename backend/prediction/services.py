import os
import sys
from pathlib import Path
import copy

BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR))

from ml.inference.model_runner import flood_engine
from gis.spatial_manager import spatial_manager

ZONE_DRAIN_MAPPING = {
    "ZONE_MINTO": {"drain_id": "DRAIN_BARAPULLAH_FEEDER_1", "drain_name": "Minto Bridge / Central Delhi Storm Feeder", "road": "Minto Road Underpass"},
    "ZONE_ITO": {"drain_id": "DRAIN_YAMUNA_FEEDER_2", "drain_name": "ITO - Vikas Marg Relief Drain", "road": "ITO Ring Road & Vikas Marg"},
    "ZONE_KASHMERE": {"drain_id": "DRAIN_SUPPLEMENTARY_1", "drain_name": "Supplementary North Drain", "road": "ISBT Flyover Lower Loop"},
    "ZONE_AIIMS": {"drain_id": "DRAIN_KUSHAK_NALLAH", "drain_name": "Kushak Nallah Trunk", "road": "Ring Road AIIMS Underpass"},
    "ZONE_DWARKA_SEC8": {"drain_id": "DRAIN_NAJAFGARH_MAIN", "drain_name": "Najafgarh Trunk Drain", "road": "Sector 8 Arterial Underpass"},
    "ZONE_MAYUR_VIHAR": {"drain_id": "DRAIN_SHAHDARA_OUTLET", "drain_name": "Shahdara Outfall Drain", "road": "Noida Link Road Depression"},
    "ZONE_PUL_PRAHLADPUR": {"drain_id": "DRAIN_AGRA_CANAL_LINK", "drain_name": "Agra Canal Storm Bypass", "road": "MB Road Underpass"},
    "ZONE_SARITA_VIHAR": {"drain_id": "DRAIN_AGRA_CANAL_LINK", "drain_name": "Agra Canal Storm Bypass", "road": "Mathura Road Underpass"},
    "ZONE_LAJPAT_NAGAR": {"drain_id": "DRAIN_BARAPULLAH_MAIN", "drain_name": "Barapullah Nallah Trunk", "road": "Feroze Gandhi Marg Culvert"},
    "ZONE_CONNAUGHT_PLACE": {"drain_id": "DRAIN_BARAPULLAH_FEEDER_1", "drain_name": "Minto Bridge / Central Delhi Feeder", "road": "Outer Circle Radial Road 2"}
}

class FloodPredictionService:
    """
    High-level prediction service that coordinates ML models,
    geospatial feature aggregation, dynamic drainage coupling,
    and time-horizon progression.
    """
    def __init__(self):
        self.engine = flood_engine
        
    def predict_all_zones(self, weather_data=None, time_horizon="NOW"):
        if weather_data is None:
            weather_data = {
                "rainfall_intensity": 48.5,
                "cumulative_3h_rain": 82.0,
                "previous_24h_rain": 35.0,
                "forecast_next_1h": 60.0
            }
            
        zones_geojson = spatial_manager.get_flood_zones()
        rain_val = weather_data.get("rainfall_intensity", 48.5)
        drainage_network = spatial_manager.get_drainage_network(rain_val, time_horizon)
        drain_lookup = {f["properties"]["id"]: f["properties"] for f in drainage_network.get("features", [])}
        
        enriched_features = []
        
        time_multipliers = {
            "NOW": 1.0,
            "+30m": 1.40,
            "+60m": 1.85,
            "+90m": 1.50,
            "+120m": 1.10,
            "+150m": 0.70,
            "+180m": 0.35
        }
        mult = time_multipliers.get(time_horizon, 1.0)
        
        for feat in zones_geojson.get("features", []):
            feat_copy = copy.deepcopy(feat)
            props = feat_copy.get("properties", {})
            zone_id = props.get("id")
            
            # Predict
            pred = self.engine.predict_single_zone(props, weather_data)
            
            # Adjust depth and probability according to time horizon
            adj_depth = round(max(0.0, pred["predicted_water_depth_cm"] * mult), 1)
            adj_prob = round(min(0.99, max(0.02, pred["flood_probability"] * (0.5 + 0.5 * mult))), 3)
            
            if adj_depth < 5.0:
                adj_class = "LOW"
            elif adj_depth < 15.0:
                adj_class = "MODERATE"
            elif adj_depth < 35.0:
                adj_class = "HIGH"
            else:
                adj_class = "CRITICAL"
                
            # Coupled drainage association
            drain_info = ZONE_DRAIN_MAPPING.get(zone_id, {
                "drain_id": "DRAIN_BARAPULLAH_MAIN",
                "drain_name": "Municipal Storm Channel",
                "road": "Adjacent Roadway"
            })
            associated_drain = drain_lookup.get(drain_info["drain_id"], {})
            drain_util = associated_drain.get("utilization_pct", 78.0)
            drain_status = associated_drain.get("surcharge_status", "MONITORED")
            
            elev = props.get("elevation_m", 212.0)
            elev_dep = round(max(0.0, 220.0 - elev), 1)
            
            coupling_breakdown = {
                "rainfall_intensity_mm_hr": round(rain_val * mult, 1),
                "elevation_m": elev,
                "elevation_depression_m": elev_dep,
                "impervious_pct": props.get("impervious_pct", 85),
                "associated_drain_id": drain_info["drain_id"],
                "associated_drain_name": drain_info["drain_name"],
                "drainage_utilization_pct": drain_util,
                "drainage_status": drain_status,
                "affected_road": drain_info["road"],
                "coupling_formula": f"{round(rain_val * mult, 1)} mm/h Rain + {elev_dep}m Low-Lying Depression + {drain_util}% Drain Surcharge = {adj_class} Risk"
            }
            
            props["current_prediction"] = {
                "time_horizon": time_horizon,
                "risk_class": adj_class,
                "flood_probability": adj_prob,
                "predicted_water_depth_cm": adj_depth,
                "depth_category": self.engine._classify_depth(adj_depth),
                "confidence_score": pred["confidence_score"],
                "model_version": pred["model_version"],
                "contributing_factors": pred["contributing_factors"],
                "coupling_breakdown": coupling_breakdown
            }
            
            # Surface top-level properties for easy GeoJSON rendering
            props["risk_class"] = adj_class
            props["flood_probability"] = adj_prob
            props["predicted_water_depth_cm"] = adj_depth
            props["depth_category"] = self.engine._classify_depth(adj_depth)
            props["coupling_breakdown"] = coupling_breakdown
            
            enriched_features.append(feat_copy)
            
        return {
            "type": "FeatureCollection",
            "time_horizon": time_horizon,
            "weather_snapshot": weather_data,
            "drainage_summary": drainage_network.get("summary", {}),
            "features": enriched_features
        }

    def get_zone_timeline(self, zone_id, weather_data=None):
        if weather_data is None:
            weather_data = {"rainfall_intensity": 48.5}
            
        zone = spatial_manager.get_zone_by_id(zone_id)
        if not zone:
            return []
        props = zone.get("properties", {})
        return self.engine.predict_temporal_timeline(props, weather_data)

    def compute_city_summary(self, weather_data=None, time_horizon="NOW"):
        if weather_data is None:
            weather_data = {
                "rainfall_intensity": 48.5,
                "cumulative_3h_rain": 82.0,
                "previous_24h_rain": 35.0,
                "forecast_next_1h": 60.0
            }
        pred_fc = self.predict_all_zones(weather_data, time_horizon)
        features = pred_fc["features"]
        drainage_summary = pred_fc.get("drainage_summary", {})
        
        total_zones = len(features)
        high_risk_count = 0
        critical_count = 0
        max_depth = 0.0
        highest_risk_zone = "None"
        max_prob = 0.0
        
        for f in features:
            props = f.get("properties", {})
            depth = props.get("predicted_water_depth_cm", 0.0)
            prob = props.get("flood_probability", 0.0)
            r_class = props.get("risk_class", "LOW")
            
            if depth > max_depth:
                max_depth = depth
                highest_risk_zone = props.get("name", "Unknown Zone")
                max_prob = prob
                
            if r_class == "HIGH":
                high_risk_count += 1
            elif r_class == "CRITICAL":
                critical_count += 1
                
        # Overall City Risk Score (0-100)
        risk_score = round(min(100.0, (critical_count * 25.0 + high_risk_count * 12.0 + (weather_data.get("rainfall_intensity", 45) / 100.0) * 35.0)), 1)
        
        # Roads analysis
        roads_fc = spatial_manager.get_roads()
        affected_roads_count = 0
        for r in roads_fc.get("features", []):
            r_props = r.get("properties", {})
            if r_props.get("is_underpass", False) and max_depth > 15.0:
                affected_roads_count += 1
            elif r_props.get("base_elevation_m", 220.0) < 210.0:
                affected_roads_count += 1
                
        return {
            "city": "Delhi NCR",
            "time_horizon": time_horizon,
            "city_risk_score": risk_score,
            "city_alert_level": "RED" if risk_score > 70 else ("ORANGE" if risk_score > 40 else "YELLOW"),
            "current_rainfall_mm_hr": weather_data.get("rainfall_intensity", 48.5) if weather_data else 48.5,
            "rainfall_forecast_1h_mm_hr": round((weather_data.get("rainfall_intensity", 48.5) if weather_data else 48.5) * 1.25, 1),
            "affected_roads_count": affected_roads_count,
            "high_risk_zones_count": high_risk_count + critical_count,
            "critical_zones_count": critical_count,
            "max_predicted_depth_cm": max_depth,
            "highest_risk_area": highest_risk_zone,
            "highest_risk_probability": max_prob,
            "prediction_confidence_pct": 94.2,
            "next_severe_peak": "+60 MIN (19:45 IST)",
            "model_engine": "Varun XGBoost + LSTM v1.2.0",
            "drainage_summary": {
                "average_utilization_pct": drainage_summary.get("average_network_utilization_pct", 74.5),
                "bottlenecks_count": drainage_summary.get("bottlenecks_count", 3),
                "surcharged_segments_count": drainage_summary.get("surcharged_segments_count", 2),
                "network_stress_level": drainage_summary.get("network_stress_level", "HIGH")
            }
        }

    def get_simulated_alerts(self, weather_data=None, time_horizon="NOW"):
        """
        Generates structured simulated flood alerts for disaster management decision support.
        """
        if weather_data is None:
            weather_data = {"rainfall_intensity": 48.5}
            
        fc = self.predict_all_zones(weather_data, time_horizon)
        features = fc.get("features", [])
        
        alerts = []
        for f in features:
            props = f.get("properties", {})
            r_class = props.get("risk_class", "LOW")
            depth = props.get("predicted_water_depth_cm", 0.0)
            coupling = props.get("coupling_breakdown", {})
            
            if r_class in ["HIGH", "CRITICAL"] or depth >= 15.0:
                severity = "CRITICAL" if (r_class == "CRITICAL" or depth >= 35.0) else "HIGH"
                expected_time = "+30 to +60 minutes" if time_horizon == "NOW" else f"{time_horizon} horizon peak"
                
                reason = f"Convective rainfall ({coupling.get('rainfall_intensity_mm_hr', 48.5)} mm/h) over low-lying depression ({coupling.get('elevation_m', 208)}m ASL) coupled with {coupling.get('associated_drain_name', 'Trunk Drain')} at {coupling.get('drainage_utilization_pct', 85)}% capacity."
                
                actions = [
                    "Deploy auxiliary diesel dewatering pumps (min 500 GPM)",
                    "Activate electronic warning boards at upstream intersections",
                    "Divert traffic around low-lying underpasses to elevated ridge roads"
                ]
                if severity == "CRITICAL":
                    actions.insert(0, "Close underpass to all civilian vehicular traffic immediately")
                    
                alerts.append({
                    "alert_id": f"ALT-{props.get('id')}-{time_horizon.replace('+', '').replace('m', '')}",
                    "zone_id": props.get("id"),
                    "location_name": props.get("name"),
                    "ward": props.get("ward", "Delhi Central"),
                    "severity": severity,
                    "risk_class": r_class,
                    "estimated_depth_cm": depth,
                    "expected_time": expected_time,
                    "reason": reason,
                    "affected_corridor": coupling.get("affected_road", "Local Roadway"),
                    "drainage_segment": coupling.get("associated_drain_name"),
                    "drainage_utilization_pct": coupling.get("drainage_utilization_pct"),
                    "recommended_actions": actions,
                    "is_simulated_demo": True
                })
                
        # Sort by depth descending
        return sorted(alerts, key=lambda x: x["estimated_depth_cm"], reverse=True)

# Global prediction service instance
prediction_service = FloodPredictionService()

