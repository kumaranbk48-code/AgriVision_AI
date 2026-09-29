import React from 'react';
import { PredictionRequest, PredictionResponse, RecommendationItem, Language } from '../types';
import { i18n } from '../i18n';
import { Printer, X, ShieldCheck, CheckCircle2, Calendar, MapPin } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputs: PredictionRequest;
  prediction: PredictionResponse;
  recommendations: RecommendationItem[];
  lang: Language;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  inputs,
  prediction,
  recommendations,
  lang
}) => {
  const t = i18n[lang];

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        
        {/* Action Header (No Print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <Printer className="w-4 h-4 text-emerald-600" />
            <span>Farmer Advisory Report Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t.actions.print}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-8 sm:p-12 space-y-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
          
          {/* Official Document Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-emerald-600">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-slate-800 p-1.5 border border-emerald-200 dark:border-emerald-700/50 shadow-xs">
                <img src="/logo.png" alt="AgriVision AI Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                  AgriVision AI
                </h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Pre-Season Crop Yield Forecast & Advisory Certificate
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Report ID: AV-{inputs.crop.toUpperCase()}-{Date.now().toString().slice(-6)}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="flex items-center sm:justify-end gap-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{inputs.district}, {inputs.state}</span>
              </div>
            </div>
          </div>

          {/* Farm & Agronomic Parameters Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              1. Farm Field Specifications
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">TARGET CROP</span>
                <span className="font-bold text-sm text-emerald-700 dark:text-emerald-400">{inputs.crop}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">SEASON & YEAR</span>
                <span className="font-bold text-sm">{inputs.season} {inputs.year}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">FARM AREA</span>
                <span className="font-bold text-sm">{inputs.area_ha} Hectares</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">IRRIGATION TYPE</span>
                <span className="font-bold text-sm">{inputs.irrigation_type}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">SOIL CLASSIFICATION</span>
                <span className="font-bold text-sm">{inputs.soil_type} (pH {inputs.soil_ph})</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">SEASONAL RAINFALL</span>
                <span className="font-bold text-sm">{inputs.rainfall_mm} mm</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">AVERAGE TEMPERATURE</span>
                <span className="font-bold text-sm">{inputs.avg_temp_c} °C</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold">NPK DOSING (KG/HA)</span>
                <span className="font-bold text-sm">{inputs.fertilizer_n}N : {inputs.fertilizer_p}P : {inputs.fertilizer_k}K</span>
              </div>
            </div>
          </div>

          {/* Forecasted Yield & Intervals Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-2">
              2. Yield Prediction & Confidence Interval
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Expected Yield</span>
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {prediction.expected_yield_t_ha.toFixed(2)} <span className="text-sm font-normal text-slate-500">t/ha</span>
                </div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Interval: [{prediction.low_yield_t_ha.toFixed(2)} - {prediction.high_yield_t_ha.toFixed(2)}] t/ha
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Harvest Estimate</span>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {prediction.total_production_tonnes.toLocaleString()} <span className="text-sm font-normal text-slate-500">Tonnes</span>
                </div>
                <span className="text-xs text-slate-500">From {inputs.area_ha} ha field</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Risk Evaluation</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{prediction.risk_level} Seasonal Risk</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Confidence Spread: ±{(prediction.confidence_spread_pct / 2).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Key Agronomic Drivers */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              3. Significant Agronomic Drivers
            </h3>
            <div className="space-y-2 text-xs">
              {prediction.top_drivers.slice(0, 3).map((d, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{d.factor}: </span>
                    <span className="text-slate-600 dark:text-slate-300">{d[lang] || d.en}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prioritized Action Recommendations */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              4. Recommended Pre-Season Interventions
            </h3>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {i + 1}. {rec.title[lang] || rec.title.en}
                    </span>
                    <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {rec.badge}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mb-1">
                    {rec.reason[lang] || rec.reason.en}
                  </p>
                  <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                    Action: {rec.action[lang] || rec.action.en}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Signature & Provenance Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Generated by AgriVision AI ML Model (LightGBM + Quantile Conformal Estimator)</span>
            </div>
            <div>
              <span>Official Extension Copy - Valid for 2025/2026 Cropping Season</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
