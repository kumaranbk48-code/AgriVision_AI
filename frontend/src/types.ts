export type Language = 'en' | 'ta' | 'hi';

export interface Driver {
  factor: string;
  direction: 'positive' | 'negative' | 'neutral';
  impact_pct: number;
  en: string;
  ta: string;
  hi: string;
}

export interface PredictionRequest {
  crop: string;
  state: string;
  district: string;
  season: string;
  year: number;
  area_ha: number;
  soil_type: string;
  soil_ph: number;
  rainfall_mm: number;
  avg_temp_c: number;
  irrigation_type: string;
  fertilizer_n: number;
  fertilizer_p: number;
  fertilizer_k: number;
}

export interface PredictionResponse {
  expected_yield_t_ha: number;
  low_yield_t_ha: number;
  high_yield_t_ha: number;
  total_production_tonnes: number;
  area_ha: number;
  risk_level: 'Low' | 'Medium' | 'High';
  risk_color: 'emerald' | 'amber' | 'rose';
  confidence_spread_pct: number;
  historical_mean_yield: number;
  yield_vs_historical_pct: number;
  warnings: string[];
  top_drivers: Driver[];
}

export interface WhatIfResponse {
  baseline: PredictionResponse;
  simulated: PredictionResponse;
  delta_yield_t_ha: number;
  delta_yield_pct: number;
  delta_production_tonnes: number;
  risk_transition: string;
  summary: {
    en: string;
    ta: string;
    hi: string;
  };
}

export interface ScenarioResult {
  id: string;
  crop: string;
  district: string;
  season: string;
  irrigation_type: string;
  rainfall_mm: number;
  expected_yield_t_ha: number;
  low_yield_t_ha: number;
  high_yield_t_ha: number;
  total_production_tonnes: number;
  risk_level: string;
  stability_score: number;
  water_efficiency: number;
  relative_performance_pct: number;
  top_driver: string;
}

export interface CompareResponse {
  ranked_scenarios: ScenarioResult[];
  best_option_id: string;
}

export interface RecommendationItem {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  badge: string;
  impact_pct: number;
  title: {
    en: string;
    ta: string;
    hi: string;
  };
  reason: {
    en: string;
    ta: string;
    hi: string;
  };
  action: {
    en: string;
    ta: string;
    hi: string;
  };
}

export interface MetadataResponse {
  crops: string[];
  districts: string[];
  states: string[];
  district_to_state: Record<string, string>;
  soils: string[];
  irrigations: string[];
  seasons: string[];
  fertilizer_presets: Record<string, Record<string, { fertilizer_n: number; fertilizer_p: number; fertilizer_k: number }>>;
  crop_suitability: Record<string, string[]>;
  ranges: Record<string, { min: number; max: number; step: number }>;
}

export interface HistoricalRecord {
  year: number;
  yield_t_ha: number;
  production_tonnes: number;
  area_ha: number;
  rainfall_mm: number;
  avg_temp_c: number;
  irrigation_type: string;
}

export interface ForecastPoint {
  year: number;
  historical_yield: number | null;
  predicted_yield: number | null;
  lower_bound: number | null;
  upper_bound: number | null;
  type: 'Historical' | 'Forecast';
}

export interface ModelInfoResponse {
  metrics: {
    model_name: string;
    test_period: string;
    train_period: string;
    train_samples: number;
    test_samples: number;
    models_comparison: Record<string, { rmse: number; mae: number; r2: number; mape: number }>;
    primary_model_overall_metrics: { rmse: number; mae: number; r2: number; mape: number };
    per_crop_metrics: Record<string, { rmse: number; mae: number; r2: number; mape: number; count: number }>;
    global_shap_importance: Array<{ feature: string; importance: number }>;
  };
  test_scatter_sample: Array<{
    crop: string;
    district: string;
    year: number;
    actual: number;
    predicted: number;
    residual: number;
  }>;
  data_quality: {
    dataset_name: string;
    total_records: number;
    total_crops: number;
    years_span: string;
    column_provenance: Record<string, string>;
  };
}
