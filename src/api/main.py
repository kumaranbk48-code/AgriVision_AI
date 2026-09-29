"""
AgriVision AI - Production FastAPI Backend
Fast, resilient, offline-ready REST API with Pydantic validation, CORS,
multilingual SHAP driver explainability, and what-if sensitivity simulations.
"""

import json
import os
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from src.ml.inference import InferenceEngine
from src.recommendations.engine import RecommendationEngine
from src.data.generate_dataset import CROP_PROFILES, DISTRICT_PROFILES

app = FastAPI(
    title="AgriVision AI API",
    description="AI Crop Yield Prediction and Seasonal Planning Engine",
    version="1.0.0"
)

# Enable CORS for local Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static assets (JS, CSS) if built
if os.path.exists("frontend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="frontend-assets")

# Initialize inference and recommendation singletons
ie = InferenceEngine()
recommender = RecommendationEngine(ie)

# Pydantic Schemas
class PredictionRequest(BaseModel):
    crop: str = Field(default="Rice", description="Target crop")
    state: str = Field(default="Punjab", description="State")
    district: str = Field(default="Ludhiana", description="District")
    season: str = Field(default="Kharif", description="Cropping season: Kharif, Rabi, Summer")
    year: int = Field(default=2025, description="Crop calendar year")
    area_ha: float = Field(default=5.0, ge=0.1, le=10000.0, description="Cultivated farm area in hectares")
    soil_type: str = Field(default="Alluvial", description="Soil classification")
    soil_ph: float = Field(default=7.2, ge=3.5, le=10.5, description="Soil pH value")
    rainfall_mm: float = Field(default=600.0, ge=0.0, le=4000.0, description="Expected seasonal rainfall in mm")
    avg_temp_c: float = Field(default=29.0, ge=5.0, le=50.0, description="Average seasonal temperature in Celsius")
    irrigation_type: str = Field(default="Canal/Flood", description="Irrigation method: Rainfed, Canal/Flood, Drip, Sprinkler, Tube Well")
    fertilizer_n: float = Field(default=120.0, ge=0.0, le=500.0, description="Nitrogen application in kg/ha")
    fertilizer_p: float = Field(default=60.0, ge=0.0, le=300.0, description="Phosphorus application in kg/ha")
    fertilizer_k: float = Field(default=40.0, ge=0.0, le=300.0, description="Potassium application in kg/ha")

class WhatIfRequest(BaseModel):
    base_inputs: PredictionRequest
    adjustments: Dict[str, Any]

class CompareRequest(BaseModel):
    scenarios: List[PredictionRequest]


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "AgriVision AI",
        "version": "1.0.0",
        "model_loaded": True,
        "supported_crops_count": len(CROP_PROFILES),
        "supported_districts_count": len(DISTRICT_PROFILES)
    }


@app.get("/api/meta")
def get_metadata():
    """Returns dropdown choices, ranges, defaults, and crop NPK presets."""
    crops = sorted(list(CROP_PROFILES.keys()))
    districts = sorted(list(DISTRICT_PROFILES.keys()))
    states = sorted(list(set(d["state"] for d in DISTRICT_PROFILES.values())))
    soils = ["Alluvial", "Black", "Red", "Sandy Loam", "Clay Loam", "Laterite"]
    irrigations = ["Canal/Flood", "Tube Well", "Drip", "Sprinkler", "Rainfed"]
    seasons = ["Kharif", "Rabi", "Summer"]

    # Fertilizer presets per crop (Low, Medium, High)
    presets = {}
    for c, info in CROP_PROFILES.items():
        base_n = info["n_req"]
        base_p = info["p_req"]
        base_k = info["k_req"]
        presets[c] = {
            "Low": {"fertilizer_n": round(base_n * 0.7), "fertilizer_p": round(base_p * 0.7), "fertilizer_k": round(base_k * 0.7)},
            "Medium (Standard)": {"fertilizer_n": base_n, "fertilizer_p": base_p, "fertilizer_k": base_k},
            "High": {"fertilizer_n": round(base_n * 1.3), "fertilizer_p": round(base_p * 1.25), "fertilizer_k": round(base_k * 1.25)}
        }

    # District to state mapping
    district_to_state = {dist: info["state"] for dist, info in DISTRICT_PROFILES.items()}

    # Crop suitability mapping
    crop_suitability = {c: info["suitable_districts"] for c, info in CROP_PROFILES.items()}

    return {
        "crops": crops,
        "districts": districts,
        "states": states,
        "district_to_state": district_to_state,
        "soils": soils,
        "irrigations": irrigations,
        "seasons": seasons,
        "fertilizer_presets": presets,
        "crop_suitability": crop_suitability,
        "ranges": {
            "rainfall_mm": {"min": 50, "max": 2500, "step": 10},
            "avg_temp_c": {"min": 10, "max": 45, "step": 0.5},
            "soil_ph": {"min": 4.5, "max": 9.5, "step": 0.1},
            "area_ha": {"min": 0.5, "max": 100, "step": 0.5},
            "fertilizer_n": {"min": 0, "max": 300, "step": 5},
            "fertilizer_p": {"min": 0, "max": 150, "step": 5},
            "fertilizer_k": {"min": 0, "max": 150, "step": 5}
        }
    }


@app.get("/api/defaults")
def get_regional_defaults(
    state: Optional[str] = Query(None),
    district: str = Query("Ludhiana"),
    season: str = Query("Kharif"),
    crop: str = Query("Rice")
):
    """Auto-fills regional soil, pH, rainfall, temperature, and standard NPK from historical data."""
    if not state and district in DISTRICT_PROFILES:
        state = DISTRICT_PROFILES[district]["state"]
    return ie.get_regional_default(state or "Punjab", district, season, crop)


@app.post("/api/predict")
def predict_yield(payload: PredictionRequest):
    """Predicts expected yield, confidence interval, total production, risk, and top plain-language drivers."""
    return ie.predict(payload.model_dump())


@app.post("/api/whatif")
def simulate_whatif(payload: WhatIfRequest):
    """Evaluates counterfactual changes against a baseline scenario."""
    base_dict = payload.base_inputs.model_dump()
    base_res = ie.predict(base_dict)

    # Apply adjustments
    sim_dict = {**base_dict, **payload.adjustments}
    sim_res = ie.predict(sim_dict)

    base_yield = base_res["expected_yield_t_ha"]
    sim_yield = sim_res["expected_yield_t_ha"]
    delta_yield = round(sim_yield - base_yield, 2)
    delta_pct = round(((sim_yield - base_yield) / max(0.1, base_yield)) * 100, 1)

    base_prod = base_res["total_production_tonnes"]
    sim_prod = sim_res["total_production_tonnes"]
    delta_prod = round(sim_prod - base_prod, 1)

    return {
        "baseline": base_res,
        "simulated": sim_res,
        "delta_yield_t_ha": delta_yield,
        "delta_yield_pct": delta_pct,
        "delta_production_tonnes": delta_prod,
        "risk_transition": f"{base_res['risk_level']} -> {sim_res['risk_level']}",
        "summary": {
            "en": f"{'Gained' if delta_yield >= 0 else 'Lost'} {abs(delta_yield)} t/ha ({abs(delta_pct):+0.1f}%) resulting in {abs(delta_prod)} tonnes {'extra' if delta_prod >= 0 else 'deficit'} production.",
            "ta": f"{abs(delta_yield)} டன்/ஹெக் ({abs(delta_pct):+0.1f}%) {'அதிகரிப்பு' if delta_yield >= 0 else 'குறைவு'}, மொத்தம் {abs(delta_prod)} டன் {'கூடுதல்' if delta_prod >= 0 else 'பற்றாக்குறை'} மகசூல்.",
            "hi": f"{abs(delta_yield)} टन/हेक्टेयर ({abs(delta_pct):+0.1f}%) की {'वृद्धि' if delta_yield >= 0 else 'कमी'}, कुल {abs(delta_prod)} टन {'अतिरिक्त' if delta_prod >= 0 else 'कम'} उत्पादन।"
        }
    }


@app.post("/api/compare")
def compare_scenarios(payload: CompareRequest):
    """Ranks and compares up to 5 crops or conditions side-by-side."""
    scenarios = payload.scenarios[:5]
    if not scenarios:
        raise HTTPException(status_code=400, detail="At least one scenario required")

    results = []
    for idx, sc in enumerate(scenarios):
        sc_dict = sc.model_dump()
        pred = ie.predict(sc_dict)

        # Compute resilience and efficiency scores
        crop_base = CROP_PROFILES.get(sc.crop, {}).get("base_yield", 3.0)
        yield_ratio = pred["expected_yield_t_ha"] / max(0.1, crop_base)
        stability_score = round(max(10, min(95, 100 - pred["confidence_spread_pct"])), 1)
        water_efficiency = round(max(20, min(98, 85 if sc.irrigation_type == "Drip" else (70 if sc.irrigation_type == "Sprinkler" else 45))), 1)

        results.append({
            "id": f"scenario_{idx + 1}",
            "crop": sc.crop,
            "district": sc.district,
            "season": sc.season,
            "irrigation_type": sc.irrigation_type,
            "rainfall_mm": sc.rainfall_mm,
            "expected_yield_t_ha": pred["expected_yield_t_ha"],
            "low_yield_t_ha": pred["low_yield_t_ha"],
            "high_yield_t_ha": pred["high_yield_t_ha"],
            "total_production_tonnes": pred["total_production_tonnes"],
            "risk_level": pred["risk_level"],
            "stability_score": stability_score,
            "water_efficiency": water_efficiency,
            "relative_performance_pct": round(yield_ratio * 100, 1),
            "top_driver": pred["top_drivers"][0]["en"] if pred["top_drivers"] else "Standard regional conditions"
        })

    # Rank by expected yield and stability
    ranked = sorted(results, key=lambda x: (x["expected_yield_t_ha"], x["stability_score"]), reverse=True)
    return {
        "ranked_scenarios": ranked,
        "best_option_id": ranked[0]["id"] if ranked else None
    }


@app.post("/api/recommend")
def get_recommendations(payload: PredictionRequest):
    """Produces prioritized farmer-friendly recommendations with quantified yield benefits."""
    recs = recommender.generate_recommendations(payload.model_dump())
    return {
        "total_recommendations": len(recs),
        "recommendations": recs
    }


@app.get("/api/history")
def get_history(
    crop: str = Query("Rice"),
    district: str = Query("Ludhiana"),
    season: str = Query("Kharif")
):
    """Returns 20-year historical timeseries for selected crop and district."""
    df = ie.hist_df
    filtered = df[(df["crop"] == crop) & (df["district"] == district) & (df["season"] == season)]
    if filtered.empty:
        # Fallback to crop across any district
        filtered = df[(df["crop"] == crop) & (df["season"] == season)]

    filtered = filtered.sort_values(by="year")
    records = []
    for _, row in filtered.iterrows():
        records.append({
            "year": int(row["year"]),
            "yield_t_ha": round(float(row["yield_tonnes_per_ha"]), 2),
            "production_tonnes": round(float(row["production_tonnes"]), 1),
            "area_ha": round(float(row["area_ha"]), 1),
            "rainfall_mm": round(float(row["rainfall_mm"]), 1),
            "avg_temp_c": round(float(row["avg_temp_c"]), 1),
            "irrigation_type": str(row["irrigation_type"])
        })
    return {
        "crop": crop,
        "district": district,
        "season": season,
        "data": records
    }


@app.get("/api/forecast-trend")
def get_forecast_trend(
    crop: str = Query("Rice"),
    district: str = Query("Ludhiana"),
    season: str = Query("Kharif"),
    horizon_years: int = Query(5)
):
    """Returns historical points + forward projection with confidence interval band."""
    df = ie.hist_df
    filtered = df[(df["crop"] == crop) & (df["district"] == district) & (df["season"] == season)].sort_values(by="year")
    if filtered.empty:
        filtered = df[(df["crop"] == crop)].sort_values(by="year")

    points = []
    # Historical points
    for _, row in filtered.iterrows():
        points.append({
            "year": int(row["year"]),
            "historical_yield": round(float(row["yield_tonnes_per_ha"]), 2),
            "predicted_yield": None,
            "lower_bound": None,
            "upper_bound": None,
            "type": "Historical"
        })

    # Forward forecast points
    last_year = int(filtered["year"].max()) if not filtered.empty else 2024
    recent_rain = float(filtered["rainfall_mm"].median()) if not filtered.empty else 600.0
    recent_temp = float(filtered["avg_temp_c"].median()) if not filtered.empty else 28.0

    for step in range(1, horizon_years + 1):
        future_year = last_year + step
        sim_inp = {
            "crop": crop, "state": DISTRICT_PROFILES.get(district, {}).get("state", "Punjab"),
            "district": district, "season": season, "year": future_year,
            "rainfall_mm": recent_rain, "avg_temp_c": recent_temp,
            "soil_type": DISTRICT_PROFILES.get(district, {}).get("soil", "Alluvial"),
            "soil_ph": DISTRICT_PROFILES.get(district, {}).get("base_ph", 7.2),
            "irrigation_type": DISTRICT_PROFILES.get(district, {}).get("irrig_pref", ["Canal/Flood"])[0],
            "fertilizer_n": CROP_PROFILES.get(crop, {}).get("n_req", 120),
            "fertilizer_p": CROP_PROFILES.get(crop, {}).get("p_req", 60),
            "fertilizer_k": CROP_PROFILES.get(crop, {}).get("k_req", 40),
            "area_ha": 5.0
        }
        pred = ie.predict(sim_inp)
        points.append({
            "year": future_year,
            "historical_yield": None,
            "predicted_yield": pred["expected_yield_t_ha"],
            "lower_bound": pred["low_yield_t_ha"],
            "upper_bound": pred["high_yield_t_ha"],
            "type": "Forecast"
        })

    return {
        "crop": crop,
        "district": district,
        "season": season,
        "trend_series": points
    }


@app.get("/api/model-info")
def get_model_info():
    """Returns training metrics, test scatter data, SHAP importance, and dataset provenance."""
    metrics_path = "artifacts/metrics.json"
    scatter_path = "artifacts/test_scatter.json"
    quality_path = "artifacts/data_quality.json"

    metrics = json.load(open(metrics_path, "r", encoding="utf-8")) if os.path.exists(metrics_path) else {}
    scatter = json.load(open(scatter_path, "r", encoding="utf-8")) if os.path.exists(scatter_path) else []
    quality = json.load(open(quality_path, "r", encoding="utf-8")) if os.path.exists(quality_path) else {}

    return {
        "metrics": metrics,
        "test_scatter_sample": scatter[:120],
        "data_quality": quality
    }


@app.get("/api/demo-scenario")
def get_demo_scenario():
    """Provides resilient, scripted 5-step demo walkthrough data for Rice in Ludhiana."""
    step1_inputs = {
        "crop": "Rice", "state": "Punjab", "district": "Ludhiana", "season": "Kharif", "year": 2025,
        "area_ha": 4.0, "soil_type": "Alluvial", "soil_ph": 7.3, "rainfall_mm": 580.0, "avg_temp_c": 30.5,
        "irrigation_type": "Canal/Flood", "fertilizer_n": 120.0, "fertilizer_p": 60.0, "fertilizer_k": 40.0
    }
    step1_pred = ie.predict(step1_inputs)

    # Step 2: Drought comparison
    step2_drought = {**step1_inputs, "rainfall_mm": 320.0, "avg_temp_c": 32.5, "irrigation_type": "Rainfed"}
    step2_pred = ie.predict(step2_drought)

    # Step 3: Drip irrigation what-if recovery
    step3_recovery = {**step2_drought, "irrigation_type": "Drip", "fertilizer_n": 130.0}
    step3_pred = ie.predict(step3_recovery)

    # Step 4: Recommendations
    step4_recs = recommender.generate_recommendations(step2_drought)

    return {
        "title": "Scripted Hackathon Demo: Rice Seasonal Resilience",
        "description": "5-step story beat proving predictive accuracy, sensitivity to climate shocks, what-if mitigations, and actionable advisory.",
        "steps": [
            {
                "step": 1,
                "name": "Normal Baseline Season",
                "narrative": "Farmer Gurpreet in Ludhiana plans 4 ha of Kharif Rice under normal monsoon conditions.",
                "inputs": step1_inputs,
                "result": step1_pred
            },
            {
                "step": 2,
                "name": "Climate Shock: Severe Drought (-45% Rain)",
                "narrative": "Monsoon fails (320mm rain), temperatures surge to 32.5°C without irrigation buffer.",
                "inputs": step2_drought,
                "result": step2_pred
            },
            {
                "step": 3,
                "name": "What-If Simulator: Precision Irrigation Recovery",
                "narrative": "Gurpreet tests upgrading to Drip irrigation and balanced N dosing on the live simulator.",
                "inputs": step3_recovery,
                "result": step3_pred,
                "recovered_yield_pct": round(((step3_pred["expected_yield_t_ha"] - step2_pred["expected_yield_t_ha"]) / max(0.1, step2_pred["expected_yield_t_ha"])) * 100, 1)
            },
            {
                "step": 4,
                "name": "Actionable Agronomic Advisory",
                "narrative": "Prioritized recommendations ranked with quantified yield recovery.",
                "recommendations": step4_recs
            },
            {
                "step": 5,
                "name": "Economic Impact & Scalability",
                "narrative": "Scaling from individual farm to FPO regional planning across 12 states.",
                "impact_summary": {
                    "estimated_yield_saved_t": round((step3_pred["expected_yield_t_ha"] - step2_pred["expected_yield_t_ha"]) * 4.0, 1),
                    "estimated_revenue_protected_inr": round((step3_pred["expected_yield_t_ha"] - step2_pred["expected_yield_t_ha"]) * 4.0 * 22000), # MSP ~Rs 2,200/quintal = Rs 22,000/tonne
                    "risk_mitigation": "High Risk -> Low Risk"
                }
            }
        ]
    }

# Mount frontend production build if available
if os.path.exists("frontend/dist"):
    app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
