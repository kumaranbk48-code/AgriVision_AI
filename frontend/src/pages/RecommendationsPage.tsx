import React, { useState } from 'react';
import {
  RecommendationItem,
  PredictionRequest,
  Language
} from '../types';
import { i18n } from '../i18n';
import {
  Lightbulb,
  Droplets,
  Sprout,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface RecommendationsPageProps {
  recommendations: RecommendationItem[];
  inputs: PredictionRequest;
  onNavigateToWhatIf: (inputs: PredictionRequest) => void;
  lang: Language;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  recommendations,
  inputs,
  onNavigateToWhatIf,
  lang
}) => {
  const t = i18n[lang];
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const categories = ['All', 'Irrigation', 'Fertilizer', 'Soil Health', 'Crop Diversification'];

  const filtered = filterCategory === 'All'
    ? recommendations
    : recommendations.filter(r => r.category.toLowerCase().includes(filterCategory.toLowerCase()));

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700';
    }
  };

  return (
    <div className="space-y-8 py-4">
      
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
                    🌱 Prioritized Agronomic Advisory
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    Counterfactual Driven
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-emerald-200/70">
                  Quantified yield interventions computed by re-running the ML model on alternative input configurations.
                </p>
              </div>
            </div>
          </div>

          {/* Current Farm Context Pill */}
          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/70 dark:bg-[#0c1a11]/80 text-slate-700 dark:text-emerald-200 border border-emerald-900/10 dark:border-emerald-500/20">
            <span>🌾 {inputs.crop}</span>
            <span>•</span>
            <span>📍 {inputs.district}</span>
            <span>•</span>
            <span>☀️ {inputs.season}</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === cat
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((rec) => {
          const localizedTitle = rec.title[lang] || rec.title.en;
          const localizedReason = rec.reason[lang] || rec.reason.en;
          const localizedAction = rec.action[lang] || rec.action.en;

          return (
            <div
              key={rec.id}
              className="glass-card p-6 border-slate-200/90 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-all shadow-sm"
            >
              <div className="space-y-3">
                {/* Header: Priority & Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getPriorityStyle(rec.priority)}`}>
                    {rec.priority} Priority
                  </span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    {rec.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                  {localizedTitle}
                </h3>

                {/* Agronomic Reason */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block text-[11px] mb-0.5">
                    Scientific Rationale:
                  </span>
                  {localizedReason}
                </div>

                {/* Recommended Field Action */}
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  <span className="font-bold block text-[11px] mb-0.5 flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Actionable Field Step:</span>
                  </span>
                  {localizedAction}
                </div>
              </div>

              {/* Card Footer: Simulator Deep Link */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  Category: {rec.category}
                </span>

                <button
                  onClick={() => onNavigateToWhatIf(inputs)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  <span>Test in Simulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
