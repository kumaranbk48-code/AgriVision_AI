import React, { useState } from 'react';
import { Language } from '../types';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Award,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenario: (tab: string) => void;
  lang: Language;
}

export const DemoModal: React.FC<DemoModalProps> = ({
  isOpen,
  onClose,
  onApplyScenario,
  lang
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      badge: "Step 1 of 5: Baseline Season",
      title: "Predicting Kharif Rice Under Normal Monsoon",
      subtitle: "Farmer Gurpreet (Ludhiana, Punjab) planning 4 hectares of Paddy",
      metrics: [
        { label: "Expected Yield", value: "4.25 t/ha", change: "+4.8% vs Dist. Avg", pos: true },
        { label: "Total Harvest", value: "17.0 Tonnes", change: "4 ha Farm Area", pos: true },
        { label: "Confidence Interval", value: "[3.90 - 4.65] t/ha", change: "High Certainty", pos: true },
        { label: "Risk Rating", value: "Low Risk", change: "Adequate Rain", pos: true }
      ],
      insight: "Under normal 580mm rainfall and canal irrigation, the LightGBM model predicts optimal vegetative biomass and high tillering capacity.",
      driver: "Top Driver: Seasonal rainfall aligns with Rice phenological water demand."
    },
    {
      step: 2,
      badge: "Step 2 of 5: Climate Shock",
      title: "Monsoon Failure: -45% Rainfall & Thermal Spike",
      subtitle: "Simulating a severe drought year (320mm rain, 32.5°C) without modern irrigation",
      metrics: [
        { label: "Expected Yield", value: "2.12 t/ha", change: "-50.1% Yield Loss", pos: false },
        { label: "Total Harvest", value: "8.5 Tonnes", change: "-8.5 t Crop Deficit", pos: false },
        { label: "Interval Spread", value: "[1.65 - 2.80] t/ha", change: "Severe Volatility", pos: false },
        { label: "Risk Rating", value: "High Risk", change: "Moisture Shock", pos: false }
      ],
      insight: "Unbuffered rainfed cultivation during rainfall deficit triggers vegetative wilting and pollen sterility, slashing production by half.",
      driver: "Top Driver: Rainfall is 45% below optimal requirement (SHAP impact: -32.5%)."
    },
    {
      step: 3,
      badge: "Step 3 of 5: What-If Sensitivity",
      title: "What-If Simulator: Precision Drip Irrigation & NPK Balancing",
      subtitle: "Testing pre-season intervention before committing farm capital",
      metrics: [
        { label: "Simulated Yield", value: "4.48 t/ha", change: "+111.3% Recovery", pos: true },
        { label: "Protected Harvest", value: "17.9 Tonnes", change: "+9.4 t Saved", pos: true },
        { label: "Uncertainty Band", value: "[4.10 - 4.85] t/ha", change: "Narrow Interval", pos: true },
        { label: "Risk Transition", value: "High -> Low Risk", change: "Fully Buffered", pos: true }
      ],
      insight: "Live what-if sensitivity reveals that micro-irrigation completely neutralizes the 45% rainfall deficit, boosting nutrient uptake efficiency.",
      driver: "Top Driver: Drip irrigation provides 90%+ water efficiency, cushioning against climate stress."
    },
    {
      step: 4,
      badge: "Step 4 of 5: Actionable Advisory",
      title: "Localized, Prioritized Agronomic Interventions",
      subtitle: "Plain-language recommendations translated into English, Tamil, and Hindi",
      metrics: [
        { label: "Intervention 1", value: "+22.5% Potential", change: "Upgrade to Drip / Sprinkler", pos: true },
        { label: "Intervention 2", value: "+12.0% Potential", change: "Correct Nitrogen to 120 kg/ha", pos: true },
        { label: "Intervention 3", value: "Diversification", change: "Evaluate Maize or Cotton", pos: true },
        { label: "Farmer Benefit", value: "Zero Guesswork", change: "Actionable Guidance", pos: true }
      ],
      insight: "AgriVision AI translates complex ML SHAP weights into simple steps for the farmer: irrigation schedule, neem-coated split urea, and soil pH amendments.",
      driver: "Advisory generated via counterfactual re-runs of the trained LightGBM model."
    },
    {
      step: 5,
      badge: "Step 5 of 5: Macro Impact & Scale",
      title: "Regional Economic Impact & Scalability Roadmap",
      subtitle: "Scaling from individual smallholder to FPOs and national seasonal planning",
      metrics: [
        { label: "Farm Revenue Saved", value: "₹2,06,800", change: "At MSP ₹2,200/q", pos: true },
        { label: "Fertilizer Waste Cut", value: "22% Saved", change: "Prevents Over-application", pos: true },
        { label: "FPO Scale Impact", value: "₹1.2 Cr / Cluster", change: "Across 600 Farmers", pos: true },
        { label: "Offline-First", value: "100% On-Device", change: "Works Without Internet", pos: true }
      ],
      insight: "By removing pre-season blind decisions, AgriVision AI protects farm livelihoods against climate volatility and optimizes agricultural supply chains.",
      driver: "Scalable across 16+ crops, 12 major agricultural states, and automated WhatsApp/SMS bots."
    }
  ];

  const current = demoSteps[currentStep - 1];

  const handleFinish = () => {
    onClose();
    onApplyScenario('impact');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0c1a11] rounded-3xl shadow-2xl border border-emerald-500/40 overflow-hidden my-6">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f4f8f2] dark:bg-[#07130b] border-b border-emerald-900/10 dark:border-emerald-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#0f2015] p-1 border border-emerald-400 dark:border-emerald-600 shadow-xs">
              <img src="/logo.png" alt="AgriVision AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-emerald-100">
                AgriVision AI Guided Demo Tour
              </span>
              <p className="text-[11px] text-slate-500 dark:text-emerald-300/70">
                2-3 Minute Hackathon Story Walkthrough
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-emerald-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center justify-between gap-2">
            {demoSteps.map((s) => (
              <div 
                key={s.step} 
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  s.step === currentStep 
                    ? 'bg-gradient-to-r from-emerald-600 to-green-600' 
                    : s.step < currentStep 
                    ? 'bg-emerald-300 dark:bg-emerald-800' 
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Slide Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              {current.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-emerald-50 mt-3">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-emerald-200/70 mt-1">
              {current.subtitle}
            </p>
          </div>

          {/* Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {current.metrics.map((m, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-white/60 dark:bg-[#0f2015] border border-emerald-900/10 dark:border-emerald-500/20 shadow-xs"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {m.label}
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white block">
                  {m.value}
                </span>
                <span className={`text-[11px] font-semibold mt-1 inline-block ${
                  m.pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {m.change}
                </span>
              </div>
            ))}
          </div>

          {/* Agronomic Insight Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Agronomic Analysis</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {current.insight}
            </p>
            <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-800 dark:text-emerald-400">
              {current.driver}
            </div>
          </div>

        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-medium text-slate-400">
            {currentStep} / {demoSteps.length}
          </span>

          {currentStep < demoSteps.length ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(demoSteps.length, prev + 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all hover:scale-[1.02]"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition-all hover:scale-[1.02]"
            >
              <span>Explore Full App & Impact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
