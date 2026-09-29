import React from 'react';
import { Driver, Language } from '../types';
import { i18n } from '../i18n';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface DriverBarChartProps {
  drivers: Driver[];
  lang: Language;
}

export const DriverBarChart: React.FC<DriverBarChartProps> = ({ drivers, lang }) => {
  const t = i18n[lang];

  if (!drivers || drivers.length === 0) {
    return (
      <div className="glass-card p-6 text-center text-slate-400 text-sm">
        No driver data available.
      </div>
    );
  }

  return (
    <div className="glass-card p-6 border-slate-200/90 dark:border-slate-800">
      
      {/* Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.labels.topDrivers}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Key factors driving this seasonal prediction higher (+) or lower (-)
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
          SHAP Values
        </span>
      </div>

      {/* Driver List */}
      <div className="space-y-3.5 mt-4">
        {drivers.map((driver, index) => {
          const isPos = driver.impact_pct >= 0;
          const barWidth = Math.min(100, Math.abs(driver.impact_pct) * 2.5);
          const localizedText = driver[lang] || driver.en;

          return (
            <div 
              key={index}
              className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              {/* Header row: Factor name + Impact badge */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  {isPos ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  )}
                  <span>{driver.factor}</span>
                </span>
                
                <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${
                  isPos 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                }`}>
                  {isPos ? '+' : ''}{driver.impact_pct}% Impact
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/80 dark:bg-slate-700/60 rounded-full h-1.5 overflow-hidden my-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPos ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              {/* Plain-Language sentence */}
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-1">
                {localizedText}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
