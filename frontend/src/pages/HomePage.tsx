import React from 'react';
import { Language } from '../types';
import { i18n } from '../i18n';
import {
  Sparkles,
  Play,
  CheckCircle2,
  TrendingUp,
  Sliders,
  ShieldCheck,
  Users,
  Building,
  Store,
  Compass,
  ArrowRight,
  Database,
  Cpu,
  Globe2
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenDemo: () => void;
  lang: Language;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenDemo, lang }) => {
  const t = i18n[lang];

  return (
    <div className="space-y-16 py-6">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-600/15 via-amber-500/5 to-emerald-950/5 border border-emerald-600/25 dark:border-emerald-500/30 p-8 sm:p-14 shadow-sm">
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-emerald-50 leading-tight">
            AI Crop Yield Prediction for{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-amber-600 bg-clip-text text-transparent">
              Seasonal Farm Planning
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
            Eliminate pre-sowing guesswork across Indian farm ecosystems. Predict expected harvest yields with conformal confidence intervals, simulate drought and micro-irrigation counterfactuals live, and access localized multilingual advisory.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 shadow-lg shadow-emerald-700/25 transition-all duration-200 hover:scale-105 active:scale-95 border border-emerald-500/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Launch Field Yield Predictor</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={onOpenDemo}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-800 dark:text-emerald-100 bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800/60 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400" />
              <span>{t.actions.tryDemo}</span>
            </button>
          </div>

          {/* Live Trust Badges */}
          <div className="pt-8 border-t border-emerald-900/10 dark:border-emerald-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-[#0c1a11]/40 border border-emerald-900/5 dark:border-emerald-500/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-200">16+</span>
              <span className="text-xs text-slate-600 dark:text-emerald-300/70 block font-semibold mt-0.5">Major Indian Crops</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-[#0c1a11]/40 border border-emerald-900/5 dark:border-emerald-500/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-200">12</span>
              <span className="text-xs text-slate-600 dark:text-emerald-300/70 block font-semibold mt-0.5">Agro-Climatic Districts</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-[#0c1a11]/40 border border-emerald-900/5 dark:border-emerald-500/10">
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">0.90+</span>
              <span className="text-xs text-slate-600 dark:text-emerald-300/70 block font-semibold mt-0.5">R² Model Accuracy</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 dark:bg-[#0c1a11]/40 border border-emerald-900/5 dark:border-emerald-500/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-800 dark:text-emerald-200">&lt;50ms</span>
              <span className="text-xs text-slate-600 dark:text-emerald-300/70 block font-semibold mt-0.5">Offline Inference</span>
            </div>
          </div>

        </div>
      </section>

      {/* The Problem Statement */}
      <section className="glass-card p-8 sm:p-12 border-emerald-900/15 dark:border-emerald-500/20">
        <div className="max-w-3xl mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>The Pre-Sowing Dilemma</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-emerald-50 mt-1">
            Pre-Season Blind Decisions Threaten 140 Million Indian Farmers
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-emerald-100/75 mt-3 leading-relaxed">
            Every seasonal sowing window (Kharif, Rabi, Summer), farmers and planners must make irrevocable capital bets—which crop to plant, how many bags of fertilizer to buy, and whether to invest in drip irrigation—without knowing seasonal climate outcomes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-400/30 dark:border-amber-800/40">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-sm mb-3 shadow-xs">
              ₹85K Cr
            </div>
            <h3 className="font-bold text-slate-900 dark:text-emerald-50 text-base">Fertilizer & Seed Misallocation</h3>
            <p className="text-xs text-slate-600 dark:text-emerald-200/70 mt-2 leading-relaxed">
              Excessive or poorly timed fertilizer and seed purchases waste farmer savings on crops doomed by subnormal monsoon rains.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-400/30 dark:border-rose-900/40">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 flex items-center justify-center font-black text-sm mb-3 shadow-xs">
              -45%
            </div>
            <h3 className="font-bold text-slate-900 dark:text-emerald-50 text-base">Climate Shock Yield Drops</h3>
            <p className="text-xs text-slate-600 dark:text-emerald-200/70 mt-2 leading-relaxed">
              Monsoon droughts and unseasonal heatwaves strike sensitive flowering phases without advance contingency plans.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-400/30 dark:border-emerald-800/40">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm mb-3 shadow-xs">
              0-Data
            </div>
            <h3 className="font-bold text-slate-900 dark:text-emerald-50 text-base">Field Extension Blindspots</h3>
            <p className="text-xs text-slate-600 dark:text-emerald-200/70 mt-2 leading-relaxed">
              Extension officers lack real-time digital simulators to show farmers the quantitative payoff of switching irrigation or inputs.
            </p>
          </div>
        </div>
      </section>

      {/* Target Personas */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Farm Value Chain
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-emerald-50 mt-1">
            Empowering Every Agricultural Stakeholder
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="glass-card p-5 border-emerald-900/10 dark:border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-3 shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-emerald-100 text-sm">Smallholder Farmers</h4>
            <p className="text-xs text-slate-600 dark:text-emerald-200/60 mt-1.5 leading-relaxed">
              Select highest-margin, lowest-risk crops and avoid wasted fertilizer spending.
            </p>
          </div>

          <div className="glass-card p-5 border-emerald-900/10 dark:border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-3 shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-emerald-100 text-sm">Extension Officers</h4>
            <p className="text-xs text-slate-600 dark:text-emerald-200/60 mt-1.5 leading-relaxed">
              Generate printable, science-backed advisory reports during field visits.
            </p>
          </div>

          <div className="glass-card p-5 border-emerald-900/10 dark:border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 flex items-center justify-center mb-3 shadow-xs">
              <Building className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-emerald-100 text-sm">FPOs & Cooperatives</h4>
            <p className="text-xs text-slate-600 dark:text-emerald-200/60 mt-1.5 leading-relaxed">
              Aggregate member harvest volumes and negotiate better collective prices.
            </p>
          </div>

          <div className="glass-card p-5 border-emerald-900/10 dark:border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center mb-3 shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-emerald-100 text-sm">Input Dealers</h4>
            <p className="text-xs text-slate-600 dark:text-emerald-200/60 mt-1.5 leading-relaxed">
              Forecast regional seed and fertilizer inventory demand before the season starts.
            </p>
          </div>

          <div className="glass-card p-5 border-emerald-900/10 dark:border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center mb-3 shadow-xs">
              <Globe2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-emerald-100 text-sm">Seasonal Planners</h4>
            <p className="text-xs text-slate-600 dark:text-emerald-200/60 mt-1.5 leading-relaxed">
              Model district buffer stocks, procurement requirements, and MSP subsidies.
            </p>
          </div>

        </div>
      </section>

      {/* How AgriVision AI Works */}
      <section className="glass-card p-8 sm:p-12 border-emerald-900/15 dark:border-emerald-500/20">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Agronomic Intelligence Engine
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-emerald-50 mt-1">
            How AgriVision AI Solves Pre-Season Risk
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 p-5 rounded-2xl bg-white/40 dark:bg-[#0c1a11]/40 border border-emerald-900/10 dark:border-emerald-500/10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-lg shadow-xs">
              🌾
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">Auto-Filled Regional Baseline</h3>
            <p className="text-xs text-slate-600 dark:text-emerald-200/70 leading-relaxed">
              Select your District and Crop. Historical weather, median soil pH, and standard ICAR fertilizer recommendations auto-fill instantly from regional data.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-white/40 dark:bg-[#0c1a11]/40 border border-emerald-900/10 dark:border-emerald-500/10">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-lg shadow-xs">
              ⚡
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">Conformal Quantile Machine Learning</h3>
            <p className="text-xs text-slate-600 dark:text-emerald-200/70 leading-relaxed">
              Trained on 20 years of historical yields, our LightGBM model outputs [10%, Expected, 90%] yield bands with TreeExplainer SHAP agronomic drivers.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-white/40 dark:bg-[#0c1a11]/40 border border-emerald-900/10 dark:border-emerald-500/10">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex items-center justify-center font-black text-lg shadow-xs">
              🌦️
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-emerald-100">Live What-If Counterfactuals</h3>
            <p className="text-xs text-slate-600 dark:text-emerald-200/70 leading-relaxed">
              Slide rainfall down for drought or test drip irrigation live. Get quantified yield deltas (+X%) and localized advice in English, Tamil, and Hindi.
            </p>
          </div>
        </div>

        {/* CTA Launch Banner */}
        <div className="mt-12 pt-8 border-t border-emerald-900/10 dark:border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0f2015] p-1.5 border border-emerald-400 dark:border-emerald-600 shadow-xs">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-emerald-200">
              Ready to test a seasonal crop prediction?
            </span>
          </div>

          <button
            onClick={() => onNavigate('predict')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 shadow-md shadow-emerald-700/20 transition-all hover:scale-105"
          >
            <span>Open Predictor Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
