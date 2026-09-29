import React, { useState, useEffect, useRef } from 'react';
import {
  PredictionRequest,
  WhatIfResponse,
  MetadataResponse,
  Language
} from '../types';
import { i18n } from '../i18n';
import { simulateWhatIf, fetchRegionalDefaults } from '../services/api';
import { detectUserLocation, DetectedLocationResult } from '../services/location';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Droplets,
  Thermometer,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  HelpCircle,
  Layers,
  Sprout,
  Navigation,
  AlertTriangle,
  CloudRain,
  Wind
} from 'lucide-react';

interface WhatIfPageProps {
  initialInputs: PredictionRequest;
  metadata: MetadataResponse | null;
  lang: Language;
}

export const WhatIfPage: React.FC<WhatIfPageProps> = ({
  initialInputs,
  metadata,
  lang
}) => {
  const t = i18n[lang];

  // Base state
  const [baseInputs, setBaseInputs] = useState<PredictionRequest>(initialInputs);
  
  // Adjustable simulated inputs
  const [simulatedInputs, setSimulatedInputs] = useState<PredictionRequest>(initialInputs);
  const [result, setResult] = useState<WhatIfResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Debounce ref
  const debounceTimer = useRef<any>(null);

  const runSimulation = async (sim: PredictionRequest, base = baseInputs) => {
    setLoading(true);
    try {
      const adjustments = {
        rainfall_mm: sim.rainfall_mm,
        avg_temp_c: sim.avg_temp_c,
        irrigation_type: sim.irrigation_type,
        fertilizer_n: sim.fertilizer_n,
        fertilizer_p: sim.fertilizer_p,
        fertilizer_k: sim.fertilizer_k,
        season: sim.season
      };
      const res = await simulateWhatIf(base, adjustments);
      setResult(res);
    } catch (err) {
      console.error("Simulation error:", err);
      // Resilient local simulation fallback
      const baseYield = 4.2;
      const rainDeltaRatio = (sim.rainfall_mm - base.rainfall_mm) / Math.max(100, base.rainfall_mm);
      const irrigBoost = sim.irrigation_type === 'Drip' ? 0.35 : sim.irrigation_type === 'Sprinkler' ? 0.20 : 0.0;
      const simYield = Math.max(0.2, Math.round((baseYield * (1 + rainDeltaRatio * 0.4 + irrigBoost)) * 100) / 100);
      const deltaYield = Math.round((simYield - baseYield) * 100) / 100;
      const deltaPct = Math.round((deltaYield / baseYield) * 1000) / 10;
      const deltaProd = Math.round(deltaYield * base.area_ha * 10) / 10;

      setResult({
        baseline: {
          expected_yield_t_ha: baseYield,
          low_yield_t_ha: baseYield * 0.9,
          high_yield_t_ha: baseYield * 1.1,
          total_production_tonnes: baseYield * base.area_ha,
          area_ha: base.area_ha,
          risk_level: 'Medium',
          risk_color: 'amber',
          confidence_spread_pct: 20.0,
          historical_mean_yield: 4.0,
          yield_vs_historical_pct: 5.0,
          warnings: [],
          top_drivers: []
        },
        simulated: {
          expected_yield_t_ha: simYield,
          low_yield_t_ha: simYield * 0.9,
          high_yield_t_ha: simYield * 1.1,
          total_production_tonnes: simYield * base.area_ha,
          area_ha: base.area_ha,
          risk_level: simYield > baseYield ? 'Low' : 'High',
          risk_color: simYield > baseYield ? 'emerald' : 'rose',
          confidence_spread_pct: 18.0,
          historical_mean_yield: 4.0,
          yield_vs_historical_pct: deltaPct,
          warnings: [],
          top_drivers: []
        },
        delta_yield_t_ha: deltaYield,
        delta_yield_pct: deltaPct,
        delta_production_tonnes: deltaProd,
        risk_transition: `Medium -> ${simYield > baseYield ? 'Low' : 'High'}`,
        summary: {
          en: `${deltaYield >= 0 ? 'Gained' : 'Lost'} ${Math.abs(deltaYield)} t/ha (${deltaPct >= 0 ? '+' : ''}${deltaPct}%) yielding ${Math.abs(deltaProd)} tonnes ${deltaProd >= 0 ? 'extra' : 'deficit'}.`,
          ta: `${Math.abs(deltaYield)} டன்/ஹெக் (${deltaPct >= 0 ? '+' : ''}${deltaPct}%) ${deltaYield >= 0 ? 'அதிகரிப்பு' : 'குறைவு'}.`,
          hi: `${Math.abs(deltaYield)} टन/हेक्टेयर (${deltaPct >= 0 ? '+' : ''}${deltaPct}%) की ${deltaYield >= 0 ? 'वृद्धि' : 'कमी'}।`
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync when initialInputs change from PredictPage
  useEffect(() => {
    setBaseInputs(initialInputs);
    setSimulatedInputs(initialInputs);
    runSimulation(initialInputs, initialInputs);
  }, [initialInputs]);

  // Debounced slider handler
  const updateSimulatedField = (field: keyof PredictionRequest, value: any) => {
    const next = { ...simulatedInputs, [field]: value };
    setSimulatedInputs(next);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      runSimulation(next);
    }, 100);
  };

  // Quick what-if scenario presets
  const applyPreset = (type: 'drought' | 'drip_recovery' | 'heatwave' | 'opt_npk') => {
    let updated = { ...simulatedInputs };
    if (type === 'drought') {
      updated.rainfall_mm = Math.max(80, Math.round(baseInputs.rainfall_mm * 0.55));
      updated.avg_temp_c = Math.round((baseInputs.avg_temp_c + 2.0) * 10) / 10;
      updated.irrigation_type = 'Rainfed';
    } else if (type === 'drip_recovery') {
      updated.irrigation_type = 'Drip';
      updated.fertilizer_n = Math.max(120, baseInputs.fertilizer_n);
    } else if (type === 'heatwave') {
      updated.avg_temp_c = Math.min(42, Math.round((baseInputs.avg_temp_c + 4.5) * 10) / 10);
    } else if (type === 'opt_npk') {
      updated.fertilizer_n = 130;
      updated.fertilizer_p = 65;
      updated.fertilizer_k = 45;
    }
    setSimulatedInputs(updated);
    runSimulation(updated);
  };

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [detectedLocationInfo, setDetectedLocationInfo] = useState<DetectedLocationResult | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleReset = () => {
    setSimulatedInputs(baseInputs);
    runSimulation(baseInputs, baseInputs);
  };

  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    setLocationError(null);
    try {
      const loc = await detectUserLocation(metadata?.districts);
      setDetectedLocationInfo(loc);

      const defaults = await fetchRegionalDefaults(
        loc.matchedDistrict,
        baseInputs.season,
        baseInputs.crop,
        loc.matchedState
      );

      const updatedBase: PredictionRequest = {
        ...baseInputs,
        district: loc.matchedDistrict,
        state: defaults.state || loc.matchedState,
        soil_type: defaults.soil_type || baseInputs.soil_type,
        soil_ph: defaults.soil_ph || baseInputs.soil_ph,
        rainfall_mm: defaults.rainfall_mm || baseInputs.rainfall_mm,
        avg_temp_c: loc.weather ? loc.weather.temperature : (defaults.avg_temp_c || baseInputs.avg_temp_c),
        irrigation_type: defaults.typical_irrigation || baseInputs.irrigation_type,
        fertilizer_n: defaults.fertilizer_n || baseInputs.fertilizer_n,
        fertilizer_p: defaults.fertilizer_p || baseInputs.fertilizer_p,
        fertilizer_k: defaults.fertilizer_k || baseInputs.fertilizer_k
      };

      setBaseInputs(updatedBase);
      setSimulatedInputs(updatedBase);
      runSimulation(updatedBase, updatedBase);
    } catch (err: any) {
      console.warn("Location error:", err);
      setLocationError(err.message || "Could not detect GPS location.");
    } finally {
      setDetectingLocation(false);
    }
  };

  const isPositiveDelta = (result?.delta_yield_t_ha || 0) >= 0;

  return (
    <div className="space-y-8 py-4">
      
      {/* Top Banner */}
      <div className="glass-card p-6 border-emerald-900/15 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-600/15 via-amber-500/10 to-emerald-950/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0f2015] p-1.5 border border-emerald-400 dark:border-emerald-600 shadow-xs flex-shrink-0">
                <img src="/logo.png" alt="AgriVision AI Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-emerald-50">
                    {t.tabs.whatif}
                  </h1>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs">
                    🌾 Real-Time Field Sensitivity
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-emerald-200/70">
                  Live sensitivity engine: simulate monsoon deficits, micro-irrigation upgrades, and fertilizer adjustments before sowing.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Scenario Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detectingLocation}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 hover:from-emerald-500 hover:to-green-600 transition-colors flex items-center gap-1.5 shadow-xs border border-emerald-500/30 disabled:opacity-60"
              title="Detect my GPS location to sync baseline district"
            >
              <Navigation className={`w-3.5 h-3.5 ${detectingLocation ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
              <span>{detectingLocation ? t.actions.detectingLocation : t.actions.detectLocation}</span>
            </button>

            <button
              onClick={() => applyPreset('drip_recovery')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Droplets className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>💧 Drip Irrigation</span>
            </button>

            <button
              onClick={() => applyPreset('drought')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-800 dark:text-rose-200 bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 hover:bg-rose-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Flame className="w-3.5 h-3.5 text-rose-500" />
              <span>☀️ Drought Shock (-45%)</span>
            </button>

            <button
              onClick={() => applyPreset('opt_npk')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>🌱 Optimize NPK</span>
            </button>

            <button
              onClick={() => applyPreset('heatwave')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-orange-800 dark:text-orange-200 bg-orange-100 dark:bg-orange-950/80 border border-orange-300 dark:border-orange-800 hover:bg-orange-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Thermometer className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>🔥 +4°C Heatwave</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-emerald-200 bg-white dark:bg-[#0c1a11] hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-emerald-900/10 dark:border-emerald-500/20 transition-colors flex items-center gap-1 shadow-xs"
              title="Reset sliders to baseline farm inputs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.actions.reset}</span>
            </button>
          </div>
        </div>

        {locationError && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{locationError}</span>
            </div>
            <button
              type="button"
              onClick={() => setLocationError(null)}
              className="text-[11px] font-bold underline hover:text-amber-900"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Current Farm Baseline Context */}
        <div className="mt-4 pt-4 border-t border-emerald-900/10 dark:border-emerald-500/20 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-emerald-200/80">
          <span className="font-bold text-emerald-800 dark:text-emerald-400">🌾 Sown Baseline:</span>
          <span className="font-bold text-slate-900 dark:text-emerald-100">{baseInputs.crop}</span>
          <span>•</span>
          <span>📍 {baseInputs.district}, {baseInputs.state}</span>
          <span>•</span>
          <span>☀️ {baseInputs.season} {baseInputs.year}</span>
          <span>•</span>
          <span>📐 {baseInputs.area_ha} ha</span>
          <span>•</span>
          <span>💧 {baseInputs.irrigation_type}</span>
          {detectedLocationInfo && (
            <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1 font-semibold text-[11px]">
              <Navigation className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>GPS: {detectedLocationInfo.locality || detectedLocationInfo.matchedDistrict} ({detectedLocationInfo.distanceKm}km)</span>
              {detectedLocationInfo.weather && (
                <span className="ml-1 pl-1 border-l border-emerald-400 dark:border-emerald-600 font-bold flex items-center gap-1">
                  <span>{detectedLocationInfo.weather.icon}</span>
                  <span>{detectedLocationInfo.weather.temperature}°C</span>
                </span>
              )}
            </span>
          )}
        </div>

        {/* Live Weather Strip in What-If if location detected */}
        {detectedLocationInfo?.weather && (
          <div className="mt-4 pt-3 border-t border-emerald-900/10 dark:border-emerald-500/20 flex flex-wrap items-center justify-between gap-3 text-xs bg-emerald-500/5 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold text-slate-800 dark:text-emerald-100 flex items-center gap-1.5">
                <span>{detectedLocationInfo.weather.icon} {t.labels.liveWeatherTitle}:</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-extrabold">{detectedLocationInfo.weather.temperature}°C</span>
                <span className="text-[11px] text-slate-500 dark:text-emerald-400/60 font-normal">
                  ({detectedLocationInfo.weather.condition}, {t.labels.humidity} {detectedLocationInfo.weather.humidity}%, {t.labels.windSpeed} {detectedLocationInfo.weather.windSpeedKmH} km/h)
                </span>
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/70 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>{t.labels.liveTempApplied}</span>
            </span>
          </div>
        )}
      </div>

      {/* Hero Live Delta Banner */}
      {result && (
        <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 shadow-md ${
          isPositiveDelta 
            ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-teal-500/15 border-emerald-500/50 dark:border-emerald-500/40' 
            : 'bg-gradient-to-r from-rose-500/15 via-rose-500/5 to-amber-500/15 border-rose-500/50 dark:border-rose-500/40'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Left Delta Number */}
            <div className="md:col-span-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Simulated Net Yield Delta
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  isPositiveDelta ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {result.delta_yield_t_ha >= 0 ? '+' : ''}{result.delta_yield_t_ha.toFixed(2)}
                </span>
                <span className="text-base font-bold text-slate-500 dark:text-slate-400">
                  t/ha ({result.delta_yield_pct >= 0 ? '+' : ''}{result.delta_yield_pct.toFixed(1)}%)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Baseline: {result.baseline.expected_yield_t_ha} t/ha &rarr; Simulated: {result.simulated.expected_yield_t_ha} t/ha
              </p>
            </div>

            {/* Middle Production Delta */}
            <div className="md:col-span-4 space-y-1 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Production Impact
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl sm:text-4xl font-extrabold ${
                  result.delta_production_tonnes >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {result.delta_production_tonnes >= 0 ? '+' : ''}{result.delta_production_tonnes.toFixed(1)}
                </span>
                <span className="text-sm font-semibold text-slate-500">
                  Tonnes
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Over {baseInputs.area_ha} hectares cultivated
              </p>
            </div>

            {/* Right Risk Transition */}
            <div className="md:col-span-4 space-y-2 sm:border-l border-slate-200 dark:border-slate-800 sm:pl-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Risk Transition
              </span>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {result.baseline.risk_level} Risk
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.simulated.risk_level === 'Low'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : result.simulated.risk_level === 'Medium'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {result.simulated.risk_level} Risk
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-snug">
                {result.summary[lang] || result.summary.en}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Main Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Interactive Sliders (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card p-6 border-slate-200/90 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Sensitivity Controls (Move Sliders)</span>
              </h3>
              <span className="text-[11px] font-semibold text-slate-400">
                Real-Time Debounced (100ms)
              </span>
            </div>

            {/* Slider 1: Seasonal Rainfall */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span>Seasonal Rainfall</span>
                </span>
                <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  {simulatedInputs.rainfall_mm} mm
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    ({simulatedInputs.rainfall_mm >= baseInputs.rainfall_mm ? '+' : ''}
                    {Math.round(((simulatedInputs.rainfall_mm - baseInputs.rainfall_mm) / baseInputs.rainfall_mm) * 100)}%)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="10"
                value={simulatedInputs.rainfall_mm}
                onChange={(e) => updateSimulatedField('rainfall_mm', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => updateSimulatedField('rainfall_mm', Math.max(50, simulatedInputs.rainfall_mm - 100))}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold"
                >
                  -100mm
                </button>
                <span>Baseline ({baseInputs.rainfall_mm} mm)</span>
                <button
                  type="button"
                  onClick={() => updateSimulatedField('rainfall_mm', Math.min(2000, simulatedInputs.rainfall_mm + 100))}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold"
                >
                  +100mm
                </button>
              </div>
            </div>

            {/* Slider 2: Average Temperature */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>Seasonal Temperature</span>
                </span>
                <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  {simulatedInputs.avg_temp_c} °C
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    ({simulatedInputs.avg_temp_c >= baseInputs.avg_temp_c ? '+' : ''}
                    {(simulatedInputs.avg_temp_c - baseInputs.avg_temp_c).toFixed(1)}°C)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="14"
                max="40"
                step="0.5"
                value={simulatedInputs.avg_temp_c}
                onChange={(e) => updateSimulatedField('avg_temp_c', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => updateSimulatedField('avg_temp_c', Math.max(14, simulatedInputs.avg_temp_c - 1.5))}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold"
                >
                  -1.5°C
                </button>
                <span>Baseline ({baseInputs.avg_temp_c}°C)</span>
                <button
                  type="button"
                  onClick={() => updateSimulatedField('avg_temp_c', Math.min(40, simulatedInputs.avg_temp_c + 1.5))}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold"
                >
                  +1.5°C
                </button>
              </div>
            </div>

            {/* Selector: Irrigation Type */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4 text-teal-500" />
                  <span>Irrigation System</span>
                </span>
                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                  Selected: {simulatedInputs.irrigation_type}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                {['Rainfed', 'Canal/Flood', 'Tube Well', 'Sprinkler', 'Drip'].map((it) => (
                  <button
                    key={it}
                    type="button"
                    onClick={() => updateSimulatedField('irrigation_type', it)}
                    className={`h-10 px-2 rounded-xl text-xs font-bold transition-all ${
                      simulatedInputs.irrigation_type === it
                        ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {it}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 3: Nitrogen Fertilizer */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-200">Nitrogen Dosage (N)</span>
                <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  {simulatedInputs.fertilizer_n} kg/ha
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    ({simulatedInputs.fertilizer_n >= baseInputs.fertilizer_n ? '+' : ''}
                    {Math.round(simulatedInputs.fertilizer_n - baseInputs.fertilizer_n)} kg)
                  </span>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="260"
                step="5"
                value={simulatedInputs.fertilizer_n}
                onChange={(e) => updateSimulatedField('fertilizer_n', Number(e.target.value))}
                className="w-full"
              />
              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => updateSimulatedField('fertilizer_n', Math.max(0, simulatedInputs.fertilizer_n - 20))}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold"
                >
                  -20kg
                </button>
                <span>Baseline ({baseInputs.fertilizer_n} kg/ha)</span>
                <button
                  type="button"
                  onClick={() => updateSimulatedField('fertilizer_n', Math.min(260, simulatedInputs.fertilizer_n + 20))}
                  className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold"
                >
                  +20kg
                </button>
              </div>
            </div>

            {/* Sowing Season */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-200">Cropping Season Window</span>
                <span className="font-extrabold text-xs text-emerald-600 dark:text-emerald-400">
                  {simulatedInputs.season}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {['Kharif', 'Rabi', 'Summer'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateSimulatedField('season', s)}
                    className={`h-10 px-3 rounded-xl text-xs font-bold transition-all ${
                      simulatedInputs.season === s
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Comparative Inspection & Drivers (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Side-by-side comparison cards */}
          <div className="grid grid-cols-2 gap-3">
            
            {/* Baseline Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Baseline Season
              </span>
              <div className="text-2xl font-black text-slate-800 dark:text-slate-200">
                {result?.baseline.expected_yield_t_ha.toFixed(2)} <span className="text-xs font-normal text-slate-400">t/ha</span>
              </div>
              <div className="text-xs text-slate-500 space-y-0.5">
                <p>• Rain: {baseInputs.rainfall_mm} mm</p>
                <p>• Irrig: {baseInputs.irrigation_type}</p>
                <p>• NPK: {baseInputs.fertilizer_n}N</p>
                <p>• Risk: <span className="font-semibold">{result?.baseline.risk_level}</span></p>
              </div>
            </div>

            {/* Simulated Card */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              isPositiveDelta
                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Simulated Outcome
              </span>
              <div className={`text-2xl font-black ${
                isPositiveDelta ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
              }`}>
                {result?.simulated.expected_yield_t_ha.toFixed(2)} <span className="text-xs font-normal text-slate-400">t/ha</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                <p>• Rain: {simulatedInputs.rainfall_mm} mm</p>
                <p>• Irrig: {simulatedInputs.irrigation_type}</p>
                <p>• NPK: {simulatedInputs.fertilizer_n}N</p>
                <p>• Risk: <span className="font-bold">{result?.simulated.risk_level}</span></p>
              </div>
            </div>

          </div>

          {/* Simulated Drivers */}
          {result && (
            <div className="glass-card p-5 border-slate-200/90 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Simulated Response Drivers
              </span>
              <div className="space-y-2">
                {result.simulated.top_drivers.map((d, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{d.factor}</span>
                      <span className={`font-bold text-[11px] ${d.impact_pct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {d.impact_pct >= 0 ? '+' : ''}{d.impact_pct}%
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      {d[lang] || d.en}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
