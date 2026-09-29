import copy
import numpy as np
from gis.spatial_manager import spatial_manager

class UrbanFloodGridSimulator:
    """
    Prototype 2D Cellular Urban Flood Propagation & Mass Balance Model.
    Couples precipitation, topography gradient flux, surface imperviousness,
    and drainage discharge capacity.
    
    Governing Equation (Prototype Finite Volume Mass Balance):
    Depth_{t+1}(i, j) = Depth_t(i, j) + P_rain(i, j) + Q_upstream_inflow(i, j)
                        - Q_drainage_discharge(i, j) - Q_downstream_outflow(i, j)
    """
    def __init__(self):
        self.elevation_grid_fc = spatial_manager.get_elevation_grid()
        self.grid_map = self._build_cell_index()
        
    def _build_cell_index(self):
        grid_map = {}
        for feat in self.elevation_grid_fc.get("features", []):
            props = feat.get("properties", {})
            col = props.get("col", 0)
            row = props.get("row", 0)
            grid_map[(col, row)] = feat
        return grid_map

    def run_simulation(self, rainfall_intensity_mm_hr=50.0, drainage_efficiency_pct=100.0, iterations=4):
        """
        Runs multiple propagation steps across the Delhi 2D spatial DEM mesh.
        """
        grid_fc = copy.deepcopy(self.elevation_grid_fc)
        features = grid_fc.get("features", [])
        
        # 1. Initialize cell states
        cell_states = {}
        for feat in features:
            props = feat["properties"]
            col = props.get("col", 0)
            row = props.get("row", 0)
            elev = props.get("elevation_m", 215.0)
            imp = props.get("impervious_pct", 80.0) / 100.0
            base_drain_eff = (props.get("drainage_eff_pct", 70.0) / 100.0) * (drainage_efficiency_pct / 100.0)
            
            # Initial rainfall contribution in mm/hr converted to water depth cm
            # C * I * Area factor
            initial_rain_depth_cm = (rainfall_intensity_mm_hr / 10.0) * imp * 1.5
            initial_drain_cm = base_drain_eff * (rainfall_intensity_mm_hr / 20.0) * 1.2
            
            cell_states[(col, row)] = {
                "elevation": elev,
                "water_depth": max(0.0, initial_rain_depth_cm - initial_drain_cm),
                "drain_rate": initial_drain_cm,
                "inflow": 0.0,
                "outflow": 0.0,
                "col": col,
                "row": row,
                "feature": feat
            }

        # 2. Perform 2D hydraulic gravity flow propagation iterations
        # Water flows from higher head (elevation + water_depth) to lower head neighbors
        directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]
        
        for step in range(iterations):
            # Calculate transfers
            fluxes = {k: {"inflow": 0.0, "outflow": 0.0} for k in cell_states.keys()}
            
            for (c, r), state in cell_states.items():
                curr_head = state["elevation"] + (state["water_depth"] / 100.0)
                
                # Check 4 neighbors
                for dc, dr in directions:
                    nc, nr = c + dc, r + dr
                    if (nc, nr) in cell_states:
                        nbr = cell_states[(nc, nr)]
                        nbr_head = nbr["elevation"] + (nbr["water_depth"] / 100.0)
                        
                        head_diff = curr_head - nbr_head
                        if head_diff > 0.05 and state["water_depth"] > 0.5:
                            # Gravity hydraulic transfer rate
                            transfer_cm = min(state["water_depth"] * 0.25, head_diff * 4.0)
                            fluxes[(c, r)]["outflow"] += transfer_cm
                            fluxes[(nc, nr)]["inflow"] += transfer_cm
                            
            # Apply fluxes & drainage relief
            for (c, r), state in cell_states.items():
                net_change = fluxes[(c, r)]["inflow"] - fluxes[(c, r)]["outflow"]
                state["water_depth"] = max(0.0, state["water_depth"] + net_change)
                state["inflow"] = round(fluxes[(c, r)]["inflow"], 2)
                state["outflow"] = round(fluxes[(c, r)]["outflow"], 2)

        # 3. Format result features with updated properties
        max_sim_depth = 0.0
        flooded_cells = 0
        
        for (c, r), state in cell_states.items():
            depth = round(state["water_depth"], 1)
            feat = state["feature"]
            props = feat["properties"]
            
            props["simulated_water_depth_cm"] = depth
            props["inflow_rate_cm"] = state["inflow"]
            props["outflow_rate_cm"] = state["outflow"]
            props["effective_drainage_eff_pct"] = round(props.get("drainage_eff_pct", 70.0) * (drainage_efficiency_pct / 100.0), 1)
            
            # Risk & status classification
            if depth < 5.0:
                status = "NOMINAL"
                color = "#10b981"
            elif depth < 15.0:
                status = "WATERLOGGED"
                color = "#f59e0b"
            elif depth < 30.0:
                status = "HIGH_INUNDATION"
                color = "#ef4444"
            else:
                status = "SEVERE_FLOOD"
                color = "#7f1d1d"
                
            props["flood_status"] = status
            props["status_color"] = color
            
            if depth > max_sim_depth:
                max_sim_depth = depth
            if depth >= 15.0:
                flooded_cells += 1

        return {
            "type": "FeatureCollection",
            "simulation_meta": {
                "rainfall_intensity_mm_hr": rainfall_intensity_mm_hr,
                "drainage_efficiency_pct": drainage_efficiency_pct,
                "simulation_engine": "Varun 2D Finite Volume Grid Propagation (Prototype)",
                "max_simulated_depth_cm": max_sim_depth,
                "flooded_cells_count": flooded_cells,
                "total_cells": len(features)
            },
            "features": features
        }

# Global simulator instance
grid_simulator = UrbanFloodGridSimulator()
