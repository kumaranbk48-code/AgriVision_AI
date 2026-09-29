import {
  PredictionRequest,
  PredictionResponse,
  WhatIfResponse,
  CompareResponse,
  RecommendationItem,
  MetadataResponse,
  HistoricalRecord,
  ForecastPoint,
  ModelInfoResponse
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function fetchMetadata(): Promise<MetadataResponse> {
  const res = await fetch(`${BASE_URL}/api/meta`);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
}

export async function fetchRegionalDefaults(
  district: string,
  season: string,
  crop: string,
  state?: string
): Promise<any> {
  const params = new URLSearchParams({ district, season, crop });
  if (state) params.append('state', state);
  const res = await fetch(`${BASE_URL}/api/defaults?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch regional defaults');
  return res.json();
}

export async function predictYield(payload: PredictionRequest): Promise<PredictionResponse> {
  const res = await fetch(`${BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to compute prediction');
  return res.json();
}

export async function simulateWhatIf(
  base_inputs: PredictionRequest,
  adjustments: Record<string, any>
): Promise<WhatIfResponse> {
  const res = await fetch(`${BASE_URL}/api/whatif`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ base_inputs, adjustments })
  });
  if (!res.ok) throw new Error('Failed to simulate what-if');
  return res.json();
}

export async function compareScenarios(scenarios: PredictionRequest[]): Promise<CompareResponse> {
  const res = await fetch(`${BASE_URL}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenarios })
  });
  if (!res.ok) throw new Error('Failed to compare scenarios');
  return res.json();
}

export async function fetchRecommendations(payload: PredictionRequest): Promise<{ total_recommendations: number; recommendations: RecommendationItem[] }> {
  const res = await fetch(`${BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to fetch recommendations');
  return res.json();
}

export async function fetchHistory(
  crop: string,
  district: string,
  season: string
): Promise<{ crop: string; district: string; season: string; data: HistoricalRecord[] }> {
  const params = new URLSearchParams({ crop, district, season });
  const res = await fetch(`${BASE_URL}/api/history?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function fetchForecastTrend(
  crop: string,
  district: string,
  season: string,
  horizon_years: number = 5
): Promise<{ crop: string; district: string; season: string; trend_series: ForecastPoint[] }> {
  const params = new URLSearchParams({ crop, district, season, horizon_years: horizon_years.toString() });
  const res = await fetch(`${BASE_URL}/api/forecast-trend?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch forecast trend');
  return res.json();
}

export async function fetchModelInfo(): Promise<ModelInfoResponse> {
  const res = await fetch(`${BASE_URL}/api/model-info`);
  if (!res.ok) throw new Error('Failed to fetch model info');
  return res.json();
}

export async function fetchDemoScenario(): Promise<any> {
  const res = await fetch(`${BASE_URL}/api/demo-scenario`);
  if (!res.ok) throw new Error('Failed to fetch demo scenario');
  return res.json();
}
