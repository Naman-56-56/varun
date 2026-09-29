import networkx as nx
from gis.spatial_manager import spatial_manager

NODE_COORDINATES = {
    "NODE_CP": [77.2195, 28.6328],
    "NODE_MINTO": [77.2238, 28.6320],
    "NODE_ITO": [77.2420, 28.6280],
    "NODE_DHAULA_KUAN": [77.1620, 28.5920],
    "NODE_AIIMS": [77.2085, 28.5675],
    "NODE_LAJPAT": [77.2420, 28.5710],
    "NODE_SARITA_VIHAR": [77.2920, 28.5300],
    "NODE_PRAHLADPUR": [77.2820, 28.5060],
    "NODE_MAYUR_VIHAR": [77.2960, 28.5980],
    "NODE_KASHMERE_GATE": [77.2310, 28.6680],
    "NODE_DWARKA": [77.0700, 28.5680]
}

NODE_NAMES = {
    "NODE_CP": "Connaught Place (Central Hub)",
    "NODE_MINTO": "Minto Bridge Underpass",
    "NODE_ITO": "ITO Junction & Vikas Marg",
    "NODE_DHAULA_KUAN": "Dhaula Kuan Interchange",
    "NODE_AIIMS": "AIIMS Trauma Center & Ring Road",
    "NODE_LAJPAT": "Lajpat Nagar Central",
    "NODE_SARITA_VIHAR": "Sarita Vihar Underpass",
    "NODE_PRAHLADPUR": "Pul Prahladpur Underpass",
    "NODE_MAYUR_VIHAR": "Mayur Vihar Phase 1",
    "NODE_KASHMERE_GATE": "Kashmere Gate ISBT",
    "NODE_DWARKA": "Dwarka Sector 8 Metro"
}

def build_delhi_road_graph():
    """
    Constructs a NetworkX bidirectional multi-graph from Delhi GeoJSON road network.
    """
    G = nx.DiGraph()
    
    for node_id, coords in NODE_COORDINATES.items():
        G.add_node(node_id, pos=coords, name=NODE_NAMES.get(node_id, node_id))
        
    roads_fc = spatial_manager.get_roads()
    for feat in roads_fc.get("features", []):
        props = feat.get("properties", {})
        geom = feat.get("geometry", {})
        
        u = props.get("start_node")
        v = props.get("end_node")
        length = float(props.get("length_km", 1.0))
        speed = float(props.get("speed_kmh", 45))
        base_elev = float(props.get("base_elevation_m", 215.0))
        is_underpass = props.get("is_underpass", False)
        road_id = props.get("id")
        road_name = props.get("name")
        coords = geom.get("coordinates", [])
        
        travel_time_min = (length / max(speed, 10.0)) * 60.0
        
        # Add bidirectional edges
        edge_data = {
            "road_id": road_id,
            "name": road_name,
            "length_km": length,
            "speed_kmh": speed,
            "travel_time_min": travel_time_min,
            "base_elevation_m": base_elev,
            "is_underpass": is_underpass,
            "coordinates": coords
        }
        
        G.add_edge(u, v, **edge_data)
        
        # Reverse edge
        reverse_data = dict(edge_data)
        reverse_data["coordinates"] = list(reversed(coords))
        G.add_edge(v, u, **reverse_data)
        
    return G
