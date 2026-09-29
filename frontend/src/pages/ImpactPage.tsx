import React, { useState } from 'react';
import { Language } from '../types';
import { i18n } from '../i18n';
import {
  Award,
  Calculator,
  TrendingUp,
  ShieldCheck,
  Compass,
  AlertCircle,
  Radio,
  Satellite,
  MessageSquare,
  Users,
  Building,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

interface ImpactPageProps {
  lang: Language;
}

export const ImpactPage: React.FC<ImpactPageProps> = ({ lang }) => {
  const t = i18n[lang];

  // Interactive ROI Calculator State
  const [calcArea, setCalcArea] = useState<number>(5.0);
  const [calcCrop, setCalcCrop] = useState<string>('Rice');

  const cropMspMap: Record<string, { mspPerTonne: number; typicalGainT: number; inputSavingPerHa: number }> = {
    Rice: { mspPerTonne: 22000, typicalGainT: 0.85, inputSavingPerHa: 2400 },
    Wheat: { mspPerTonne: 22750, typicalGainT: 0.70, inputSavingPerHa: 2200 },
    Maize: { mspPerTonne: 20900, typicalGainT: 1.10, inputSavingPerHa: 1900 },
    Cotton: { mspPerTonne: 71200, typicalGainT: 0.45, inputSavingPerHa: 3800 },
    Sugarcane: { mspPerTonne: 3400, typicalGainT: 12.0, inputSavingPerHa: 5200 },
    Soybean: { mspPerTonne: 46000, typicalGainT: 0.50, inputSavingPerHa: 2100 },
    Groundnut: { mspPerTonne: 63750, typicalGainT: 0.55, inputSavingPerHa: 2600 }
  };

  const cropConfig = cropMspMap[calcCrop] || cropMspMap['Rice'];
  const totalExtraYieldT = Math.round(cropConfig.typicalGainT * calcArea * 10) / 10;
  const protectedRevenueInr = Math.round(totalExtraYieldT * cropConfig.mspPerTonne);
  const inputSavingsInr = Math.round(cropConfig.inputSavingPerHa * calcArea);
  const netEconomicBenefitInr = protectedRevenueInr + inputSavingsInr;

  return (
    <div className="space-y-12 py-4">
      
      {/* Top Banner */}
      <div className="glass-card p-6 border-emerald-900/15 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-600/15 via-amber-500/10 to-emerald-950/10 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0f2015] p-1.5 border border-emerald-400 dark:border-emerald-600 shadow-xs flex-shrink-0">
                <img src="/logo.png" alt="AgriVision AI Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-emerald-50">
                    💰 Economic Impact & Scalability Roadmap
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Quantified Value
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-emerald-200/70">
                  Empirical benefit modeling, multi-stakeholder value propositions, scalability pathway, and scientific boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Economic Benefit Calculator */}
      <section className="glass-card p-6 sm:p-10 border-slate-200/90 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>Interactive Farm ROI & Economic Impact Calculator</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Derived from what-if sensitivity simulations & Government of India MSP benchmarks (clearly labelled as estimates).
            </p>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Model-Derived Estimates
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controls: 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Select Crop Enterprise
              </label>
              <select
                value={calcCrop}
                onChange={(e) => setCalcCrop(e.target.value)}
                className="w-full text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5"
              >
                {Object.keys(cropMspMap).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-600 dark:text-slate-300">Cultivated Farm Area</span>
                <span className="text-emerald-600 font-bold">{calcArea} Hectares</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={calcArea}
                onChange={(e) => setCalcArea(Number(e.target.value))}
                className="w-full mt-2"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 ha (Marginal)</span>
                <span>5 ha (Smallholder)</span>
                <span>25 ha (Commercial / FPO)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 space-y-1">
              <p>• Government MSP: ₹{(cropConfig.mspPerTonne / 10).toLocaleString()} / Quintal</p>
              <p>• Avg Counterfactual Yield Boost: +{cropConfig.typicalGainT} t/ha</p>
              <p>• Urea / Water Input Rationalization: ₹{cropConfig.inputSavingPerHa.toLocaleString()} / ha</p>
            </div>
          </div>

          {/* Results: 7 cols */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Yield Protected
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                +{totalExtraYieldT} <span className="text-xs font-normal text-slate-400">Tonnes</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Via pre-season planning
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Input Costs Saved
              </span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{inputSavingsInr.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                Fertilizer & irrigation savings
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-2 border-emerald-500/30">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                Net Farmgate Value
              </span>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                ₹{netEconomicBenefitInr.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-400 block mt-1 font-semibold">
                Protected farm earnings
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* Stakeholder Value Matrix */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Who Benefits and How
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Holistic economic value distributed across every layer of the agricultural ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="glass-card p-6 border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Smallholder Farmers (1-5 ha)</h4>
                <p className="text-xs text-slate-400">Individual Field Level</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Eliminates ruinous crop failure by identifying high-risk crops before purchasing expensive seeds.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Cuts wasted fertilizer expense by 15-25% through crop-specific ICAR Mitscherlich saturation limits.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Provides printable advisory certificates to secure formal institutional bank credit.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">FPOs & Cooperatives</h4>
                <p className="text-xs text-slate-400">Aggregated Cluster Level</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Consolidates total expected cluster tonnage for advance forward-contracting with grain buyers.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Enables bulk discount procurement of district-adapted inputs (e.g. biofertilizers and drip tubing).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Reduces group-level default risk under joint-liability credit schemes.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Agri-Extension Officers & KVKs</h4>
                <p className="text-xs text-slate-400">Government & Advisory Network</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Replaces qualitative rules of thumb with model-backed quantified yield impacts (+X.X%).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Works 100% offline in remote gram panchayats without requiring continuous mobile internet.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Instant multilingual printouts eliminate communication friction.</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 border-slate-200/90 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">Input Retailers & Planners</h4>
                <p className="text-xs text-slate-400">Market & Policy Infrastructure</p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Avoids dead retail inventory by predicting real regional demand for seeds and crop protection chemicals.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Enables state food corporations to anticipate district-level grain procurement and warehouse storage requirements.</span>
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* Scalability Roadmap */}
      <section className="glass-card p-6 sm:p-10 border-slate-200/90 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Scalability Roadmap
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Path from hackathon prototype to national deployment across 700+ agricultural districts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Phase 1 (Live Today)
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Offline Core Engine</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              16 Crops, 12 Major Districts, Conformal LightGBM Quantile Bands, What-If Simulator, EN/TA/HI Support.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Phase 2 (Q1 2027)
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Live Open-Meteo & Radar</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Automated seasonal outlook fetching with offline fallback cache; IMD Doppler weather radar alerts.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Phase 3 (Q2 2027)
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">WhatsApp & Vernacular Voice</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Voice-based interactive phone advisory (IVR) and conversational WhatsApp bot for non-literate farmers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Phase 4 (Q4 2027)
            </span>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Satellite NDVI Earth Obs</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sentinel-2 multispectral vegetation index and root-zone soil moisture raster ingestion for sub-plot precision.
            </p>
          </div>

        </div>
      </section>

      {/* Honest Scientific Limitations */}
      <section className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Honest Scientific Limitations & Boundary Conditions
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">1. Catastrophic Climate Outliers:</strong>
            Predictions for climate variables exceeding 3 standard deviations from historical norms exhibit wider conformal interval bands.
          </p>
          <p>
            <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">2. Localized Pest & Disease:</strong>
            Macro seasonal models do not account for sudden biological infestations (e.g. Locust swarms or Fall Armyworm) which require field scouting.
          </p>
          <p>
            <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">3. Micronutrient Specifics:</strong>
            Soil health card median values are regional; farmers should corroborate with physical soil samples for Zinc/Boron/Sulfur amendments.
          </p>
        </div>
      </section>

    </div>
  );
};
