import os
import sys
import django

# Setup Django test environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
import json

def run_e2e_verification():
    print("================================================================")
    print("  VARUN URBAN FLOOD NOWCASTING SYSTEM (SIH26085) - API TESTS")
    print("================================================================")
    client = Client()
    
    # 1. Dashboard Metrics
    r = client.get('/api/dashboard/')
    assert r.status_code == 200, f"Dashboard failed: {r.status_code}"
    data = r.json()
    print(f"[OK] [GET /api/dashboard/] City Score: {data['city_risk_score']}/100, Max Depth: {data['max_predicted_depth_cm']} cm, Alert: {data['city_alert_level']}")
    
    # 2. Weather & Radar Forecast
    r = client.get('/api/weather/')
    assert r.status_code == 200, f"Weather failed: {r.status_code}"
    data = r.json()
    print(f"[OK] [GET /api/weather/] Current Rain: {data['current']['rainfall_intensity_mm_hr']} mm/hr, Stations: {len(data['stations'])}")
    
    # 3. Flood Zones GeoJSON with ML Predictions
    r = client.get('/api/flood/zones/?horizon=+60m')
    assert r.status_code == 200, f"Zones failed: {r.status_code}"
    data = r.json()
    print(f"[OK] [GET /api/flood/zones/?horizon=+60m] Loaded {len(data['features'])} zones. Horizon: {data['time_horizon']}")
    
    # 4. Multi-Horizon Timeline
    r = client.get('/api/flood/timeline/?zone_id=ZONE_MINTO')
    assert r.status_code == 200, f"Timeline failed: {r.status_code}"
    data = r.json()
    print(f"[OK] [GET /api/flood/timeline/] Minto Bridge timesteps: {[t['time_horizon'] for t in data['timeline']]}")
    
    # 5. 2D Hydrodynamic Grid Simulation
    r = client.post('/api/flood/simulation/', data=json.dumps({"rainfall_intensity_mm_hr": 75.0, "drainage_efficiency_pct": 80.0}), content_type="application/json")
    assert r.status_code == 200, f"Simulation failed: {r.status_code}"
    data = r.json()
    print(f"[OK] [POST /api/flood/simulation/] Max simulated depth: {data['simulation_meta']['max_simulated_depth_cm']} cm ({data['simulation_meta']['flooded_cells_count']} cells flooded)")
    
    # 6. Roads & Drainage Networks (Coupled Hydraulic Service)
    r_roads = client.get('/api/roads/')
    r_drain = client.get('/api/drainage/?horizon=+60m')
    r_drain_sum = client.get('/api/drainage/summary/?horizon=+60m')
    r_drain_nodes = client.get('/api/drainage/nodes/')
    r_drain_detail = client.get('/api/drainage/DRAIN_BARAPULLAH_FEEDER_1/?horizon=+60m')
    assert r_roads.status_code == 200 and r_drain.status_code == 200 and r_drain_sum.status_code == 200 and r_drain_nodes.status_code == 200 and r_drain_detail.status_code == 200
    sum_data = r_drain_sum.json()
    detail_data = r_drain_detail.json()
    print(f"[OK] [GET /api/drainage/ & /api/drainage/summary/] Roads: {len(r_roads.json()['features'])}, Drainage Channels: {len(r_drain.json()['features'])}, Drainage Nodes: {len(r_drain_nodes.json()['features'])}")
    print(f"    - Network Avg Utilization: {sum_data['average_network_utilization_pct']}%, Bottlenecks: {sum_data['bottlenecks_count']}, Stress: {sum_data['network_stress_level']}")
    print(f"    - Minto Feeder Flow: {detail_data['properties']['current_flow_m3s']} m³/s ({detail_data['properties']['utilization_pct']}% util) - Status: {detail_data['properties']['surcharge_status']}")

    # 7. Simulated Alerts System
    r_alerts = client.get('/api/alerts/?horizon=+60m')
    assert r_alerts.status_code == 200, f"Alerts failed: {r_alerts.status_code}"
    alert_data = r_alerts.json()
    print(f"[OK] [GET /api/alerts/] Loaded {alert_data['total_alerts']} simulated alerts ({alert_data['critical_alerts_count']} critical). Top Alert: {alert_data['alerts'][0]['location_name']} ({alert_data['alerts'][0]['severity']})")
    
    # 8. NetworkX Flood-Safe Routing Comparison
    payload = {
        "origin_node": "NODE_CP",
        "destination_node": "NODE_AIIMS",
        "rainfall_mm_hr": 48.5,
        "max_safe_depth_cm": 25.0
    }
    r = client.post('/api/routing/safe-route/', data=json.dumps(payload), content_type="application/json")
    assert r.status_code == 200, f"Routing failed: {r.status_code}"
    data = r.json()
    shortest = data['shortest_route']
    safest = data['safest_route']
    comp = data['comparison']
    print(f"[OK] [POST /api/routing/safe-route/] CP -> AIIMS:")
    print(f"    - Shortest: {shortest['total_distance_km']} km, {shortest['total_time_min']} min, Max Depth: {shortest['max_water_depth_cm']} cm, Exposure: {shortest['exposure_risk']}")
    print(f"    - Safest:   {safest['total_distance_km']} km, {safest['total_time_min']} min, Max Depth: {safest['max_water_depth_cm']} cm, Exposure: {safest['exposure_risk']}")
    print(f"    - Detour:   +{comp['additional_distance_km']} km, +{comp['additional_time_min']} min (Hazard reduction: -{comp['depth_reduction_cm']} cm)")
    
    # 9. ML Explainability Factors
    r = client.get('/api/explanation/?zone_id=ZONE_MINTO')
    assert r.status_code == 200, f"Explanation failed: {r.status_code}"
    data = r.json()
    print(f"[OK] [GET /api/explanation/] Top Contributing Factor for {data['zone_name']}: {data['contributing_factors'][0]['factor']}")
    
    # 10. Grounded Gemini AI Chatbot
    chat_payload = {"query": "Explain which drainage segments are bottlenecks and why Minto Bridge is flooded."}
    r = client.post('/api/chatbot/query/', data=json.dumps(chat_payload), content_type="application/json")
    assert r.status_code == 200, f"Chatbot failed: {r.status_code}"
    data = r.json()
    print(f"[OK] [POST /api/chatbot/query/] AI Engine: {data['engine']}")
    print(f"    Sample Response Snippet: {data['response'][:150]}...")
    
    print("================================================================")
    print("  ALL 10 END-TO-END VERIFICATION TESTS PASSED SUCCESSFULLY! ")
    print("================================================================")

if __name__ == "__main__":
    run_e2e_verification()

