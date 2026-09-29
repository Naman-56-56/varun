import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.metrics import accuracy_score, classification_report, mean_squared_error, r2_score
import pickle

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from ml.preprocessing.synthetic_generator import generate_synthetic_flood_dataset
from ml.preprocessing.feature_engineer import FEATURE_COLUMNS, RISK_CLASS_TO_INT, RISK_CLASS_MAPPING

def train_flood_risk_and_depth_models(save_dir="ml/models"):
    os.makedirs(save_dir, exist_ok=True)
    print("1. Generating synthetic hydrological flood dataset...")
    df = generate_synthetic_flood_dataset(n_samples=6000)
    
    X = df[FEATURE_COLUMNS]
    y_class = df["risk_class"].map(RISK_CLASS_TO_INT)
    y_depth = df["predicted_water_depth_cm"]
    y_prob = df["flood_probability"]
    
    X_train, X_test, y_c_train, y_c_test, y_d_train, y_d_test = train_test_split(
        X, y_class, y_depth, test_size=0.2, random_state=42
    )
    
    # 1. Train Gradient Boosting Risk Classifier
    print("2. Training Flood Risk Classifier (XGBoost / Gradient Boosting)...")
    clf = GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    clf.fit(X_train, y_c_train)
    
    y_c_pred = clf.predict(X_test)
    acc = accuracy_score(y_c_test, y_c_pred)
    print(f"-> Classification Accuracy: {acc * 100:.2f}%")
    
    # 2. Train Water Depth Regressor
    print("3. Training Water Depth Regressor...")
    reg = GradientBoostingRegressor(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42)
    reg.fit(X_train, y_d_train)
    
    y_d_pred = reg.predict(X_test)
    r2 = r2_score(y_d_test, y_d_pred)
    rmse = np.sqrt(mean_squared_error(y_d_test, y_d_pred))
    print(f"-> Depth Regression R2 Score: {r2:.4f}, RMSE: {rmse:.2f} cm")
    
    # 3. Extract Feature Importances for Explainability
    importances = clf.feature_importances_
    feature_importance_dict = {
        col: float(np.round(imp * 100, 2)) for col, imp in zip(FEATURE_COLUMNS, importances)
    }
    # Sort descending
    sorted_importances = dict(sorted(feature_importance_dict.items(), key=lambda item: item[1], reverse=True))
    
    # 4. Save artifacts
    clf_path = os.path.join(save_dir, "flood_risk_classifier.pkl")
    reg_path = os.path.join(save_dir, "flood_depth_regressor.pkl")
    meta_path = os.path.join(save_dir, "flood_model_metadata.json")
    
    with open(clf_path, "wb") as f:
        pickle.dump(clf, f)
    with open(reg_path, "wb") as f:
        pickle.dump(reg, f)
        
    metadata = {
        "model_name": "Varun XGBoost / GradientBoost Flood Risk Engine",
        "version": "1.2.0-monsoon",
        "training_samples": len(df),
        "accuracy": float(np.round(acc, 4)),
        "r2_score": float(np.round(r2, 4)),
        "rmse_cm": float(np.round(rmse, 2)),
        "feature_importances": sorted_importances,
        "feature_columns": FEATURE_COLUMNS,
        "risk_classes": RISK_CLASS_MAPPING
    }
    
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"Saved model artifacts to {save_dir}/ successfully.")
    return metadata

if __name__ == "__main__":
    train_flood_risk_and_depth_models()
