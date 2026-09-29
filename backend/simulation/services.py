from .grid_simulator import grid_simulator

def run_flood_simulation(rainfall_intensity_mm_hr=50.0, drainage_efficiency_pct=100.0):
    return grid_simulator.run_simulation(rainfall_intensity_mm_hr, drainage_efficiency_pct)
