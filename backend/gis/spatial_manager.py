import os
import json
from pathlib import Path
from .drainage_service import drainage_service

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_SAMPLE_DIR = BASE_DIR / "data" / "sample"

class SpatialDataManager:
    """
    Centralized spatial data manager that handles GeoJSON loading,
    spatial indexing, layer generation, and fallback sample ingestion.
    """
    def __init__(self):
        self._flood_zones = None
        self._drainage_network = None
        self._drainage_nodes = None
        self._roads = None
        self._elevation_grid = None
        self._historical_events = None
        self.load_all_datasets()
        
    def load_all_datasets(self):
        self._flood_zones = self._load_geojson("delhi_flood_zones.geojson")
        self._drainage_network = self._load_geojson("delhi_drainage.geojson")
        self._drainage_nodes = self._load_geojson("delhi_drainage_nodes.geojson")
        self._roads = self._load_geojson("delhi_roads.geojson")
        self._elevation_grid = self._load_geojson("delhi_elevation_grid.geojson")
        self._historical_events = self._load_json("historical_events.json")

    def _load_geojson(self, filename):
        file_path = DATA_SAMPLE_DIR / filename
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"type": "FeatureCollection", "features": []}

    def _load_json(self, filename):
        file_path = DATA_SAMPLE_DIR / filename
        if file_path.exists():
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def get_flood_zones(self):
        return self._flood_zones

    def get_drainage_network(self, rainfall=48.5, time_horizon="NOW"):
        if self._drainage_network:
            return drainage_service.compute_dynamic_drainage(
                self._drainage_network,
                rainfall_intensity_mm_hr=rainfall,
                time_horizon=time_horizon
            )
        return {"type": "FeatureCollection", "features": []}

    def get_raw_drainage_network(self):
        return self._drainage_network

    def get_drainage_nodes(self):
        return self._drainage_nodes

    def get_roads(self):
        return self._roads

    def get_elevation_grid(self):
        return self._elevation_grid

    def get_historical_events(self):
        return self._historical_events

    def get_zone_by_id(self, zone_id):
        for feat in self._flood_zones.get("features", []):
            if feat.get("properties", {}).get("id") == zone_id:
                return feat
        return None

    def get_drainage_segment_by_id(self, drain_id, rainfall=48.5, time_horizon="NOW"):
        dyn = self.get_drainage_network(rainfall, time_horizon)
        for feat in dyn.get("features", []):
            if feat.get("properties", {}).get("id") == drain_id:
                return feat
        return None

# Global spatial manager instance
spatial_manager = SpatialDataManager()

