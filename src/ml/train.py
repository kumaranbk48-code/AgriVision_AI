"""
AgriVision AI - Model Training, Evaluation & SHAP Analysis
Trains Ridge, Random Forest, and LightGBM models with time-series evaluation.
Produces prediction interval models (q10, q50, q90) and SHAP feature importance.
Saves reproducible model artifacts and metrics.json.
"""

import json
import os
import time
import joblib
import lightgbm as lgb
import numpy as np
import pandas as pd
import shap
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, RobustScaler
from sklearn.compose import ColumnTransformer

from src.ml.preprocess import AgronomicFeatureEngineer, prepare_dataset

SEED = 42

def compute_metrics(y_true, y_pred) -> dict:
    """Computes standardized regression metrics."""
    rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))
    mape = float(mean_absolute_percentage_error(y_true, y_pred) * 100.0)
    return {
        "rmse": round(rmse, 3),
        "mae": round(mae, 3),
        "r2": round(r2, 4),
        "mape": round(mape, 2)
    }

def main():
    print("=" * 60)
    print("AgriVision AI - Model Training & Evaluation Pipeline")
    print("=" * 60)

    # 1. Prepare data with time-based split
    print("\n[1/5] Loading and splitting dataset (Train: <=2020, Test: >=2021)...")
    X_train_raw, X_test_raw, y_train, y_test = prepare_dataset()
    print(f"Train samples: {len(X_train_raw)}, Test samples: {len(X_test_raw)}")

    # 2. Fit Agronomic Feature Engineer
    print("\n[2/5] Engineering domain-specific agronomic features...")
    fe = AgronomicFeatureEngineer()
    fe.fit(X_train_raw, y_train)

    X_train_fe = fe.transform(X_train_raw)
    X_test_fe = fe.transform(X_test_raw)

    cat_cols = ["crop", "state", "district", "season", "soil_type", "irrigation_type"]
    num_cols = [
        "year", "area_ha", "soil_ph", "rainfall_mm", "avg_temp_c",
        "fertilizer_n", "fertilizer_p", "fertilizer_k",
        "rolling_3yr_mean", "lag_yield_1yr",
        "rainfall_x_irrigation", "growing_degree_days", "heat_stress_idx",
        "npk_ratio", "total_npk", "ph_neutral_diff", "historical_benchmark_yield"
    ]

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", RobustScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols)
        ]
    )

    X_train_trans = preprocessor.fit_transform(X_train_fe)
    X_test_trans = preprocessor.transform(X_test_fe)

    cat_encoded_names = preprocessor.named_transformers_["cat"].get_feature_names_out(cat_cols).tolist()
    all_feature_names = num_cols + cat_encoded_names
    print(f"Total features after encoding: {len(all_feature_names)}")

    # 3. Train Baselines & Main Model
    print("\n[3/5] Benchmarking Models...")
    models_comparison = {}

    # Baseline 1: Ridge
    print("  -> Training Baseline 1: Ridge Regression...")
    ridge = Ridge(alpha=1.0, random_state=SEED)
    ridge.fit(X_train_trans, y_train)
    y_pred_ridge = ridge.predict(X_test_trans)
    models_comparison["Ridge Regression"] = compute_metrics(y_test, y_pred_ridge)

    # Baseline 2: Random Forest
    print("  -> Training Baseline 2: Random Forest Regressor...")
    rf = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=SEED, n_jobs=-1)
    rf.fit(X_train_trans, y_train)
    y_pred_rf = rf.predict(X_test_trans)
    models_comparison["Random Forest"] = compute_metrics(y_test, y_pred_rf)

    # Primary Model: LightGBM Regressor (Expected / Mean)
    print("  -> Training Primary Model: LightGBM Regressor...")
    lgb_main = lgb.LGBMRegressor(
        n_estimators=250,
        learning_rate=0.04,
        num_leaves=31,
        max_depth=7,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=SEED,
        verbose=-1
    )
    lgb_main.fit(X_train_trans, y_train)
    y_pred_lgb = lgb_main.predict(X_test_trans)
    models_comparison["LightGBM (Primary)"] = compute_metrics(y_test, y_pred_lgb)

    # Train Quantile Regressors for Confidence Intervals (Low: 10th percentile, High: 90th percentile)
    print("  -> Training Quantile Regressors for Prediction Intervals (q10, q90)...")
    lgb_q10 = lgb.LGBMRegressor(
        objective="quantile",
        alpha=0.10,
        n_estimators=200,
        learning_rate=0.04,
        num_leaves=31,
        max_depth=7,
        random_state=SEED,
        verbose=-1
    )
    lgb_q10.fit(X_train_trans, y_train)

    lgb_q90 = lgb.LGBMRegressor(
        objective="quantile",
        alpha=0.90,
        n_estimators=200,
        learning_rate=0.04,
        num_leaves=31,
        max_depth=7,
        random_state=SEED,
        verbose=-1
    )
    lgb_q90.fit(X_train_trans, y_train)

    # 4. Detailed Per-Crop Metrics on Test Set
    print("\n[4/5] Computing per-crop evaluation on latest years test set...")
    test_eval_df = X_test_raw.copy()
    test_eval_df["y_true"] = y_test.values
    test_eval_df["y_pred"] = y_pred_lgb
    test_eval_df["residual"] = test_eval_df["y_true"] - test_eval_df["y_pred"]

    per_crop_metrics = {}
    for crop_name, grp in test_eval_df.groupby("crop"):
        per_crop_metrics[crop_name] = compute_metrics(grp["y_true"], grp["y_pred"])
        per_crop_metrics[crop_name]["count"] = len(grp)

    # Sample actual vs predicted for frontend visualization
    test_scatter = []
    for idx, row in test_eval_df.iterrows():
        test_scatter.append({
            "crop": row["crop"],
            "district": row["district"],
            "year": int(row["year"]),
            "actual": round(float(row["y_true"]), 2),
            "predicted": round(float(row["y_pred"]), 2),
            "residual": round(float(row["residual"]), 2)
        })

    # 5. SHAP Feature Importance & Explainability
    print("\n[5/5] Computing SHAP Global Importance & Driver Weights...")
    # Use TreeExplainer on LightGBM model
    explainer = shap.TreeExplainer(lgb_main)
    # Explain a representative sample of training data (200 rows)
    shap_sample = X_train_trans[:200]
    shap_values = explainer.shap_values(shap_sample)

    # Mean absolute SHAP per feature
    mean_abs_shap = np.mean(np.abs(shap_values), axis=0)
    feat_importance_pairs = sorted(zip(all_feature_names, mean_abs_shap), key=lambda x: x[1], reverse=True)

    # Format global feature importance
    top_global_shap = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in feat_importance_pairs[:15]
    ]

    # Save artifacts
    os.makedirs("artifacts", exist_ok=True)

    bundle = {
        "feature_engineer": fe,
        "preprocessor": preprocessor,
        "cat_cols": cat_cols,
        "num_cols": num_cols,
        "all_feature_names": all_feature_names,
        "model_main": lgb_main,
        "model_q10": lgb_q10,
        "model_q90": lgb_q90
    }
    joblib.dump(bundle, "artifacts/model.joblib")
    print("Saved artifacts/model.joblib")

    metrics_payload = {
        "model_name": "AgriVision AI LightGBM Regressor with Quantile Intervals",
        "test_period": "2021 - 2024",
        "train_period": "2005 - 2020",
        "train_samples": len(X_train_raw),
        "test_samples": len(X_test_raw),
        "models_comparison": models_comparison,
        "primary_model_overall_metrics": models_comparison["LightGBM (Primary)"],
        "per_crop_metrics": per_crop_metrics,
        "global_shap_importance": top_global_shap
    }

    with open("artifacts/metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)
    print("Saved artifacts/metrics.json")

    # Save test scatter & residuals for visual analytics
    with open("artifacts/test_scatter.json", "w", encoding="utf-8") as f:
        json.dump(test_scatter[:300], f, indent=2)
    print("Saved artifacts/test_scatter.json")

    print("\n" + "=" * 60)
    print("TRAINING & BENCHMARK SUMMARY:")
    for model_name, m in models_comparison.items():
        print(f"  {model_name:22s} | R2: {m['r2']:.4f} | RMSE: {m['rmse']:.3f} | MAE: {m['mae']:.3f} | MAPE: {m['mape']:.2f}%")
    print("=" * 60)

if __name__ == "__main__":
    main()
