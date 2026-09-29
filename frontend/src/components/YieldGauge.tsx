import React from 'react';
import { PredictionResponse, Language } from '../types';
import { i18n } from '../i18n';
import { ShieldAlert, ShieldCheck, TrendingUp, TrendingDown, Layers, HelpCircle, Info } from 'lucide-react';

interface YieldGaugeProps {
  prediction: PredictionResponse;
  lang: Language;
}

export const YieldGauge: React.FC<YieldGaugeProps> = ({ prediction, lang }) => {
  const t = i18n[lang];
  const {
    expected_yield_t_ha,
    low_yield_t_ha,
    high_yield_t_ha,
    total_production_tonnes,
    area_ha,
    risk_level,
    confidence_spread_pct,
    historical_mean_yield,
    yield_vs_historical_pct
  } = prediction;

  const riskBadgeStyles = {
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
    High: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700'
  }[risk_level];

  // Gauge bar normalization
  const maxSpan = Math.max(high_yield_t_ha * 1.25, historical_mean_yield * 1.25, 5.0);
  const lowPos = Math.max(2, Math.min(95, (low_yield_t_ha / maxSpan) * 100));
  const expectedPos = Math.max(5, Math.min(95, (expected_yield_t_ha / maxSpan) * 100));
  const highPos = Math.max(10, Math.min(98, (high_yield_t_ha / maxSpan) * 100));
  const histPos = Math.max(5, Math.min(95, (historical_mean_yield / maxSpan) * 100));

  return (
    <div className="glass-card p-6 border-slate-200/90 dark:border-slate-800 relative overflow-hidden space-y-6">
      
      {/* Header with Risk Badge */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase tracking-wider font-extrabold text-slate-400">
            {t.labels.expectedYield}
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
              {expected_yield_t_ha.toFixed(2)}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-500 dark:text-slate-400">
              tonnes / ha
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ≈ {Math.round(expected_yield_t_ha * 10)} Quintals per Hectare
          </p>
        </div>

        {/* Risk Badge */}
        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {t.labels.seasonalRisk}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border shadow-xs ${riskBadgeStyles}`}>
            {risk_level === 'Low' ? (
              <ShieldCheck className="w-3.5 h-3.5" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5" />
            )}
            <span>
              {risk_level === 'Low' ? t.risk.low : risk_level === 'Medium' ? t.risk.medium : t.risk.high}
            </span>
          </span>
        </div>
      </div>

      {/* Range Visualizer Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.labels.yieldInterval}</span>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">
            ±{(confidence_spread_pct / 2).toFixed(1)}% Range
          </span>
        </div>

        {/* Visual Track */}
        <div className="relative h-6 rounded-full bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200 dark:border-slate-700">
          
          {/* Shaded interval band */}
          <div
            className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-emerald-200 via-emerald-300 to-emerald-200 dark:from-emerald-950/80 dark:via-emerald-900/60 dark:to-emerald-950/80 border border-emerald-400 dark:border-emerald-700 transition-all duration-300"
            style={{
              left: `${lowPos}%`,
              width: `${Math.max(5, highPos - lowPos)}%`
            }}
          />

          {/* Historical benchmark marker */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10"
            style={{ left: `${histPos}%` }}
            title={`District Historical Average: ${historical_mean_yield.toFixed(2)} t/ha`}
          >
            <div className="absolute -top-5 -translate-x-1/2 text-[9px] font-bold text-slate-500 whitespace-nowrap bg-white dark:bg-slate-800 px-1 rounded shadow-xs border border-slate-200 dark:border-slate-700">
              Avg: {historical_mean_yield.toFixed(1)}
            </div>
          </div>

          {/* Expected yield needle */}
          <div
            className="absolute top-0.5 bottom-0.5 w-3.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-md transform -translate-x-1/2 z-20 transition-all duration-300"
            style={{ left: `${expectedPos}%` }}
          />
        </div>

        {/* Scale labels */}
        <div className="flex justify-between items-center text-xs pt-1 text-slate-500 dark:text-slate-400 tabular-nums">
          <div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {low_yield_t_ha.toFixed(2)}
            </span>
            <span className="text-[10px] ml-1">(10% Low)</span>
          </div>
          <div className="text-center font-black text-emerald-600 dark:text-emerald-400">
            {expected_yield_t_ha.toFixed(2)} t/ha (Expected)
          </div>
          <div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {high_yield_t_ha.toFixed(2)}
            </span>
            <span className="text-[10px] ml-1">(90% High)</span>
          </div>
        </div>
      </div>

      {/* Summary Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
        
        {/* Total Production */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t.labels.totalProduction}</span>
          </div>
          <div className="mt-2 text-lg font-black text-slate-900 dark:text-white tabular-nums">
            {total_production_tonnes.toLocaleString()} <span className="text-xs font-normal text-slate-400">tonnes</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            From {area_ha} hectares
          </div>
        </div>

        {/* Yield vs Historical Average */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {yield_vs_historical_pct >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
            )}
            <span>Vs Hist. Average</span>
          </div>
          <div className={`mt-2 text-lg font-black tabular-nums ${yield_vs_historical_pct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {yield_vs_historical_pct >= 0 ? '+' : ''}{yield_vs_historical_pct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            District Avg: {historical_mean_yield.toFixed(2)} t/ha
          </div>
        </div>

        {/* Prediction Confidence */}
        <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Model Confidence</span>
          </div>
          <div className="mt-2 text-lg font-black text-slate-800 dark:text-slate-200 tabular-nums">
            {(100 - confidence_spread_pct).toFixed(0)}% <span className="text-xs font-normal text-slate-400">certainty</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Conformal LightGBM
          </div>
        </div>

      </div>

      {/* Farmer-Friendly Verdict Message */}
      <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
        risk_level === 'Low' 
          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
          : risk_level === 'Medium'
          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
      }`}>
        <p className="font-semibold flex items-center gap-2">
          <span>
            {risk_level === 'Low' 
              ? `🌱 Favorable Outlook: Expected harvest of ${expected_yield_t_ha.toFixed(2)} t/ha (${total_production_tonnes.toLocaleString()} tonnes) is above district average with stable climate buffer. Recommended for full seasonal investment.`
              : risk_level === 'Medium'
              ? `⚠️ Moderate Seasonal Caution: Moisture or nutrient conditions show mild variance. Consider micro-irrigation or split fertilizer application to protect target yield.`
              : `🚨 High Climate Stress: Substantial rainfall or thermal deficit detected. Protect investment with drip irrigation or evaluate drought-hardy crop alternatives.`
            }
          </span>
        </p>
      </div>
    </div>
  );
};
