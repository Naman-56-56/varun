import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import pickle

TIMESTEPS = ["+30m", "+60m", "+90m", "+120m", "+150m", "+180m"]

def generate_temporal_flood_sequences(n_samples=4000, random_seed=42):
    """
    Generates dynamic multi-timestep rainfall-runoff flood propagation sequences.
    Simulates peak rainfall arrival, drainage hysteresis, and gradual flood receding/expansion.
    """
    np.random.seed(random_seed)
    
    # Base input variables
    rain_0 = np.random.uniform(10, 110, size=n_samples) # initial rain intensity mm/hr
    impervious = np.random.uniform(50, 98, size=n_samples) # %
    elevation = np.random.uniform(200, 235, size=n_samples) # meters
    drainage_cap = np.random.uniform(8, 60, size=n_samples) # m3/s
    is_underpass = np.random.binomial(1, 0.2, size=n_samples)
    
    # Storm profile trajectory (e.g. convective peak at +60m, tapering by +150m)
    # Temporal multiplier factors for rainfall
    rain_profile_factors = np.array([
        1.0,  # t0
        1.35, # +30m
        1.60, # +60m (peak)
        1.25, # +90m
        0.80, # +120m
        0.45, # +150m
        0.20  # +180m
    ])
    
    # Generate multi-horizon water depths
    depth_targets = []
    
    for i in range(n_samples):
        r0 = rain_0[i]
        imp = impervious[i] / 100.0
        elev = elevation[i]
        drain = drainage_cap[i]
        underpass = is_underpass[i]
        
        elev_penalty = max(0, (225.0 - elev) / 15.0) + (underpass * 1.8)
        drain_relief = drain / 25.0
        
        current_water = 0.0
        sample_depths = []
        
        for step_idx in range(1, 7): # +30 to +180
            step_rain = r0 * rain_profile_factors[step_idx]
            inflow = (step_rain / 10.0) * imp * (1.0 + elev_penalty * 0.7) * 4.0
            outflow = drain_relief * 3.2
            
            current_water = max(0, current_water + (inflow - outflow) * 0.8)
            current_water_clipped = min(180.0, current_water + np.random.normal(0, 1.5))
            sample_depths.append(round(float(current_water_clipped), 2))
            
        depth_targets.append(sample_depths)
        
    X = pd.DataFrame({
        "rain_0": rain_0,
        "impervious_pct": impervious,
        "elevation": elevation,
        "drainage_cap": drainage_cap,
        "is_underpass": is_underpass
    })
    
    y = np.array(depth_targets)
    return X, y

def train_temporal_nowcast_model(save_dir="ml/models"):
    os.makedirs(save_dir, exist_ok=True)
    print("1. Generating temporal nowcasting sequence training dataset...")
    X, y = generate_temporal_flood_sequences(n_samples=5000)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("2. Training Temporal Multi-Step Sequence Model (LSTM / Multi-Output Forest)...")
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae_per_step = np.mean(np.abs(y_test - y_pred), axis=0)
    
    for step_name, mae in zip(TIMESTEPS, mae_per_step):
        print(f"-> Horizon {step_name} Mean Absolute Error: {mae:.2f} cm")
        
    model_path = os.path.join(save_dir, "temporal_nowcast_model.pkl")
    meta_path = os.path.join(save_dir, "temporal_model_metadata.json")
    
    with open(model_path, "wb") as f:
        pickle.dump(model, f)
        
    metadata = {
        "model_name": "Varun 3-Hour Temporal Flood Nowcasting Engine",
        "version": "1.1.0-sequence",
        "timesteps": TIMESTEPS,
        "step_mae_cm": {step: float(np.round(mae, 2)) for step, mae in zip(TIMESTEPS, mae_per_step)},
        "features": list(X.columns)
    }
    
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved temporal nowcasting artifacts to {save_dir}/ successfully.")
    return metadata

if __name__ == "__main__":
    train_temporal_nowcast_model()
