import numpy as np
import pandas as pd
import json
import os

def generate_synthetic_flood_dataset(n_samples=5000, random_seed=42):
    """
    Generates realistic synthetic training data for urban flood nowcasting based on
    hydrological principles (Rational method runoff, elevation depression, drainage choking).
    """
    np.random.seed(random_seed)
    
    # 1. Weather Features
    rainfall_intensity = np.random.gamma(shape=2.5, scale=18.0, size=n_samples) # 0 to 120 mm/hr
    rainfall_intensity = np.clip(rainfall_intensity, 0, 150)
    
    cumulative_3h_rain = rainfall_intensity * np.random.uniform(1.2, 2.8, size=n_samples) + np.random.exponential(10, size=n_samples)
    previous_24h_rain = np.random.exponential(25, size=n_samples)
    forecast_next_1h = rainfall_intensity * np.random.uniform(0.7, 1.4, size=n_samples)
    
    # 2. Terrain & Land-Use Features
    elevation = np.random.uniform(198.0, 240.0, size=n_samples) # Delhi elevation range
    slope_pct = np.random.exponential(1.0, size=n_samples)
    slope_pct = np.clip(slope_pct, 0.1, 8.0)
    
    impervious_pct = np.random.beta(a=5, b=2, size=n_samples) * 100 # Urban high imperviousness (60-98%)
    impervious_pct = np.clip(impervious_pct, 40, 99)
    
    # 3. Drainage & Proximity Features
    distance_to_drain_m = np.random.exponential(150, size=n_samples)
    distance_to_drain_m = np.clip(distance_to_drain_m, 10, 800)
    
    drainage_capacity_m3s = np.random.uniform(5.0, 60.0, size=n_samples)
    drainage_siltation_pct = np.random.uniform(10.0, 75.0, size=n_samples)
    effective_drainage_cap = drainage_capacity_m3s * (1.0 - drainage_siltation_pct / 100.0)
    
    historical_flood_freq = np.random.beta(a=2, b=4, size=n_samples)
    soil_saturation_index = np.clip(previous_24h_rain / 80.0 + (100 - elevation) / 50.0 * 0.2, 0.1, 1.0)
    is_underpass = np.random.binomial(n=1, p=0.15, size=n_samples)
    
    # 4. Physical runoff & water depth target generation
    # Rational runoff: Q = C * I * A
    runoff_coeff = (impervious_pct / 100.0) * 0.85 + (1.0 - impervious_pct / 100.0) * 0.25
    runoff_volume = runoff_coeff * (rainfall_intensity / 10.0) * 5.0 # normalized volume
    
    drainage_relief = effective_drainage_cap / 15.0
    depression_factor = np.clip((225.0 - elevation) / 25.0, 0, 2.0) + (is_underpass * 1.5)
    
    # Net water accumulation (cm)
    raw_depth = (runoff_volume * (1.0 + depression_factor * 0.8) - drainage_relief * 0.6) * 3.5
    raw_depth = np.clip(raw_depth + np.random.normal(0, 3, size=n_samples), 0, 160)
    
    # Risk Classification
    # 0-5 cm: LOW, 5-15 cm: MODERATE, 15-35 cm: HIGH, 35+ cm: CRITICAL
    risk_labels = []
    flood_prob = []
    for d in raw_depth:
        prob = 1.0 / (1.0 + np.exp(-(d - 12.0) / 6.0))
        flood_prob.append(prob)
        if d < 5.0:
            risk_labels.append("LOW")
        elif d < 15.0:
            risk_labels.append("MODERATE")
        elif d < 35.0:
            risk_labels.append("HIGH")
        else:
            risk_labels.append("CRITICAL")
            
    df = pd.DataFrame({
        "rainfall_intensity": np.round(rainfall_intensity, 2),
        "cumulative_3h_rain": np.round(cumulative_3h_rain, 2),
        "previous_24h_rain": np.round(previous_24h_rain, 2),
        "forecast_next_1h": np.round(forecast_next_1h, 2),
        "elevation": np.round(elevation, 2),
        "slope_pct": np.round(slope_pct, 2),
        "impervious_pct": np.round(impervious_pct, 2),
        "distance_to_drain_m": np.round(distance_to_drain_m, 2),
        "drainage_capacity_m3s": np.round(drainage_capacity_m3s, 2),
        "drainage_siltation_pct": np.round(drainage_siltation_pct, 2),
        "effective_drainage_cap": np.round(effective_drainage_cap, 2),
        "historical_flood_freq": np.round(historical_flood_freq, 3),
        "soil_saturation_index": np.round(soil_saturation_index, 3),
        "is_underpass": is_underpass,
        "flood_probability": np.round(flood_prob, 4),
        "predicted_water_depth_cm": np.round(raw_depth, 2),
        "risk_class": risk_labels
    })
    
    return df

if __name__ == "__main__":
    df = generate_synthetic_flood_dataset()
    os.makedirs("data/sample", exist_ok=True)
    df.to_csv("data/sample/synthetic_flood_training_data.csv", index=False)
    print(f"Generated {len(df)} samples successfully.")
