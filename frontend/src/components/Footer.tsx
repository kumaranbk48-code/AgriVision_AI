import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-emerald-900/10 dark:border-emerald-500/20 bg-[#f4f8f2]/90 dark:bg-[#07130b]/90 backdrop-blur-md py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0f2015] p-1.5 border border-emerald-400 dark:border-emerald-600 shadow-xs">
              <img src="/logo.png" alt="AgriVision AI Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-emerald-100">
                AgriVision AI
              </p>
              <p className="text-xs text-slate-500 dark:text-emerald-300/70">
                AI Crop Yield Prediction & Agronomic Sensitivity Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-emerald-200/80">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Trained on 20 Years of Historical Data & ICAR Agronomic Response Benchmarks</span>
          </div>

          <div className="text-xs text-slate-500 dark:text-emerald-300/70 flex items-center gap-1 font-semibold">
            <span>Cultivated with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Indian Farmers & Agronomists</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
