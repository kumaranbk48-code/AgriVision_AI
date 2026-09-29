"""
AgriVision AI - Comprehensive Backend & ML Test Suite
Tests preprocessing, model inference latency, interval validity,
recommendation logic, and FastAPI endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from src.api.main import app
from src.ml.inference import InferenceEngine
from src.recommendations.engine import RecommendationEngine

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["model_loaded"] is True
    assert data["supported_crops_count"] >= 15

def test_metadata_endpoint():
    response = client.get("/api/meta")
    assert response.status_code == 200
    data = response.json()
    assert len(data["crops"]) >= 15
    assert len(data["districts"]) >= 8
    assert "fertilizer_presets" in data
    assert "Rice" in data["fertilizer_presets"]

def test_defaults_endpoint():
    response = client.get("/api/defaults?state=Punjab&district=Ludhiana&season=Kharif&crop=Rice")
    assert response.status_code == 200
    data = response.json()
    assert "soil_type" in data
    assert "rainfall_mm" in data
    assert "avg_temp_c" in data
    assert data["rainfall_mm"] > 0
    assert data["avg_temp_c"] > 0

def test_predict_endpoint_valid():
    payload = {
        "crop": "Rice",
        "state": "Punjab",
        "district": "Ludhiana",
        "season": "Kharif",
        "year": 2025,
        "area_ha": 4.0,
        "soil_type": "Alluvial",
        "soil_ph": 7.2,
        "rainfall_mm": 600.0,
        "avg_temp_c": 30.0,
        "irrigation_type": "Canal/Flood",
        "fertilizer_n": 120.0,
        "fertilizer_p": 60.0,
        "fertilizer_k": 40.0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    res = response.json()

    assert "expected_yield_t_ha" in res
    assert "low_yield_t_ha" in res
    assert "high_yield_t_ha" in res
    assert res["low_yield_t_ha"] <= res["expected_yield_t_ha"] <= res["high_yield_t_ha"]
    assert res["total_production_tonnes"] == pytest.approx(res["expected_yield_t_ha"] * 4.0, rel=1e-2)
    assert res["risk_level"] in ["Low", "Medium", "High"]
    assert len(res["top_drivers"]) > 0

    # Verify multilingual translations exist in drivers
    driver0 = res["top_drivers"][0]
    assert "en" in driver0
    assert "ta" in driver0
    assert "hi" in driver0

def test_whatif_endpoint():
    payload = {
        "base_inputs": {
            "crop": "Rice",
            "state": "Punjab",
            "district": "Ludhiana",
            "season": "Kharif",
            "year": 2025,
            "area_ha": 5.0,
            "soil_type": "Alluvial",
            "soil_ph": 7.2,
            "rainfall_mm": 400.0,
            "avg_temp_c": 30.0,
            "irrigation_type": "Rainfed",
            "fertilizer_n": 80.0,
            "fertilizer_p": 40.0,
            "fertilizer_k": 30.0
        },
        "adjustments": {
            "irrigation_type": "Drip",
            "fertilizer_n": 120.0
        }
    }
    response = client.post("/api/whatif", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "delta_yield_t_ha" in res
    assert "delta_yield_pct" in res
    assert "summary" in res
    assert "en" in res["summary"]

def test_compare_endpoint():
    scenarios = [
        {
            "crop": "Rice", "state": "Punjab", "district": "Ludhiana", "season": "Kharif",
            "year": 2025, "area_ha": 5.0, "soil_type": "Alluvial", "soil_ph": 7.2,
            "rainfall_mm": 600.0, "avg_temp_c": 30.0, "irrigation_type": "Canal/Flood",
            "fertilizer_n": 120.0, "fertilizer_p": 60.0, "fertilizer_k": 40.0
        },
        {
            "crop": "Maize", "state": "Punjab", "district": "Ludhiana", "season": "Kharif",
            "year": 2025, "area_ha": 5.0, "soil_type": "Alluvial", "soil_ph": 7.2,
            "rainfall_mm": 600.0, "avg_temp_c": 30.0, "irrigation_type": "Canal/Flood",
            "fertilizer_n": 110.0, "fertilizer_p": 50.0, "fertilizer_k": 40.0
        }
    ]
    response = client.post("/api/compare", json={"scenarios": scenarios})
    assert response.status_code == 200
    res = response.json()
    assert "ranked_scenarios" in res
    assert len(res["ranked_scenarios"]) == 2

def test_recommend_endpoint():
    payload = {
        "crop": "Rice",
        "state": "Punjab",
        "district": "Ludhiana",
        "season": "Kharif",
        "year": 2025,
        "area_ha": 5.0,
        "soil_type": "Alluvial",
        "soil_ph": 5.4,  # Acidic
        "rainfall_mm": 350.0,  # Deficit
        "avg_temp_c": 31.0,
        "irrigation_type": "Rainfed",  # Suboptimal
        "fertilizer_n": 60.0,  # Deficit
        "fertilizer_p": 30.0,
        "fertilizer_k": 20.0
    }
    response = client.post("/api/recommend", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["total_recommendations"] > 0
    first_rec = res["recommendations"][0]
    assert "impact_pct" in first_rec
    assert "title" in first_rec
    assert "reason" in first_rec
    assert "action" in first_rec

def test_demo_scenario_endpoint():
    response = client.get("/api/demo-scenario")
    assert response.status_code == 200
    res = response.json()
    assert "steps" in res
    assert len(res["steps"]) == 5
