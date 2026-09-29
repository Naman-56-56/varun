import os
import json
from pathlib import Path
import copy

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class DrainageHydraulicService:
    """
    Hydraulic service for urban stormwater drainage modeling.
    Couples rainfall telemetry with drainage geometry, siltation,
    upstream-downstream graph topology, and outfall stage.
    """
    def __init__(self):
        pass

    def compute_dynamic_drainage(self, base_drainage_geojson, rainfall_intensity_mm_hr=48.5, time_horizon="NOW"):
        """
        Calculates dynamic flow, utilization %, surcharge status, and bottlenecks
        for each drainage segment based on live rainfall and temporal nowcast horizon.
        """
        time_multipliers = {
            "NOW": 1.0,
            "+30m": 1.35,
            "+60m": 1.65,
            "+90m": 1.45,
            "+120m": 1.15,
            "+150m": 0.85,
            "+180m": 0.50
        }
        mult = time_multipliers.get(time_horizon, 1.0)
        effective_rain = rainfall_intensity_mm_hr * mult

        features = copy.deepcopy(base_drainage_geojson.get("features", []))
        enriched_features = []
        bottlenecks = []
        total_capacity = 0.0
        total_effective_capacity = 0.0
        total_flow = 0.0

        # Segment-specific catchment scale factors
        catchment_factors = {
            "DRAIN_NAJAFGARH_MAIN": {"area_km2": 42.0, "upstream": ["Dwarka Sector 8", "Janakpuri", "Rohini Basin"], "downstream": "Yamuna River (Wazirabad Barrage)"},
            "DRAIN_BARAPULLAH_MAIN": {"area_km2": 28.0, "upstream": ["AIIMS", "Lajpat Nagar", "Defence Colony", "Kushak Nallah"], "downstream": "Yamuna River (Nizamuddin)"},
            "DRAIN_SHAHDARA_OUTLET": {"area_km2": 32.0, "upstream": ["Mayur Vihar Phase 1", "Laxmi Nagar", "East Delhi Basin"], "downstream": "Yamuna River (Okhla Barrage)"},
            "DRAIN_SUPPLEMENTARY_1": {"area_km2": 18.0, "upstream": ["Kashmere Gate ISBT", "Civil Lines", "GT Road Corridor"], "downstream": "Najafgarh Outfall"},
            "DRAIN_KUSHAK_NALLAH": {"area_km2": 14.0, "upstream": ["AIIMS Underpass", "INA Market", "Kidwai Nagar"], "downstream": "Barapullah Trunk"},
            "DRAIN_BARAPULLAH_FEEDER_1": {"area_km2": 8.5, "upstream": ["Minto Bridge Underpass", "Connaught Place", "Barakhamba Road"], "downstream": "Yamuna Feeder 2"},
            "DRAIN_YAMUNA_FEEDER_2": {"area_km2": 12.0, "upstream": ["ITO Junction", "Vikas Marg", "Supreme Court Corridor"], "downstream": "Yamuna River (ITO Barrage)"},
            "DRAIN_AGRA_CANAL_LINK": {"area_km2": 22.0, "upstream": ["Sarita Vihar", "Pul Prahladpur", "Badarpur"], "downstream": "Agra Canal"}
        }

        for feat in features:
            props = feat.get("properties", {})
            drain_id = props.get("id")
            cap = float(props.get("capacity_m3s", 30.0))
            silt = float(props.get("siltation_pct", 30.0))
            eff_cap = round(cap * (1.0 - (silt / 100.0) * 0.8), 1)

            cfg = catchment_factors.get(drain_id, {
                "area_km2": 10.0,
                "upstream": ["Local Sub-Catchment"],
                "downstream": props.get("outfall", "Yamuna River")
            })

            # Hydraulic runoff discharge: Q = C * I * A / 360 (Rational approximation scaled for m3/s)
            runoff_coeff = 0.82  # Urban paved catchment
            raw_flow = (runoff_coeff * effective_rain * cfg["area_km2"]) / 18.0
            
            # Additional flow surcharge for known bottlenecks during intense bursts
            if drain_id in ["DRAIN_BARAPULLAH_FEEDER_1", "DRAIN_YAMUNA_FEEDER_2", "DRAIN_KUSHAK_NALLAH"] and effective_rain > 40:
                raw_flow *= 1.25

            est_flow = round(min(raw_flow, eff_cap * 1.4), 1)
            utilization_pct = round((est_flow / eff_cap) * 100.0, 1) if eff_cap > 0 else 100.0

            if utilization_pct >= 95.0:
                surcharge_status = "SURCHARGED / BOTTLENECK"
                status_color = "#ef4444"
                risk_level = "SEVERE"
            elif utilization_pct >= 85.0:
                surcharge_status = "NEAR CAPACITY"
                status_color = "#ea580c"
                risk_level = "HIGH"
            elif utilization_pct >= 65.0:
                surcharge_status = "MONITORED"
                status_color = "#d97706"
                risk_level = "MODERATE"
            else:
                surcharge_status = "NORMAL FLOW"
                status_color = "#06b6d4"
                risk_level = "LOW"

            props.update({
                "effective_capacity_m3s": eff_cap,
                "current_flow_m3s": est_flow,
                "utilization_pct": utilization_pct,
                "surcharge_status": surcharge_status,
                "risk_level": risk_level,
                "status_color": status_color,
                "upstream_catchments": cfg["upstream"],
                "downstream_outfall": cfg["downstream"],
                "is_bottleneck": utilization_pct >= 85.0,
                "time_horizon": time_horizon,
                "effective_rainfall_mm_hr": round(effective_rain, 1)
            })

            total_capacity += cap
            total_effective_capacity += eff_cap
            total_flow += est_flow

            if props["is_bottleneck"]:
                bottlenecks.append({
                    "id": drain_id,
                    "name": props.get("name"),
                    "utilization_pct": utilization_pct,
                    "effective_capacity_m3s": eff_cap,
                    "current_flow_m3s": est_flow,
                    "siltation_pct": silt,
                    "status": surcharge_status,
                    "impacted_catchments": cfg["upstream"],
                    "outfall": cfg["downstream"],
                    "reason": f"Siltation ({silt}%) combined with {effective_rain:.1f} mm/h rainfall burst causing backwater surcharge."
                })

            enriched_features.append(feat)

        avg_utilization = round((total_flow / total_effective_capacity) * 100.0, 1) if total_effective_capacity > 0 else 0.0

        summary = {
            "time_horizon": time_horizon,
            "rainfall_intensity_mm_hr": rainfall_intensity_mm_hr,
            "effective_rainfall_mm_hr": round(effective_rain, 1),
            "total_design_capacity_m3s": round(total_capacity, 1),
            "total_effective_capacity_m3s": round(total_effective_capacity, 1),
            "total_estimated_flow_m3s": round(total_flow, 1),
            "average_network_utilization_pct": avg_utilization,
            "total_segments": len(features),
            "bottlenecks_count": len(bottlenecks),
            "surcharged_segments_count": len([b for b in bottlenecks if b["status"] == "SURCHARGED / BOTTLENECK"]),
            "bottlenecks": sorted(bottlenecks, key=lambda x: x["utilization_pct"], reverse=True),
            "network_stress_level": "CRITICAL" if avg_utilization > 80 else ("HIGH" if avg_utilization > 60 else "MODERATE")
        }

        return {
            "type": "FeatureCollection",
            "name": "Delhi_Drainage_Network_Coupled",
            "summary": summary,
            "features": enriched_features
        }

# Global instance
drainage_service = DrainageHydraulicService()
