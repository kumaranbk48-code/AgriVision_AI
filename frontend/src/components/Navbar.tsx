import React from 'react';
import { Language } from '../types';
import { i18n } from '../i18n';
import {
  Sprout,
  Sparkles,
  Sliders,
  BarChart3,
  TrendingUp,
  Lightbulb,
  Award,
  Database,
  Play,
  Sun,
  Moon,
  Share2
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
  darkMode: boolean;
  setDarkMode: (d: boolean) => void;
  onOpenDemo: () => void;
  onShareWhatsApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  darkMode,
  setDarkMode,
  onOpenDemo,
  onShareWhatsApp
}) => {
  const t = i18n[lang];

  const navItems = [
    { id: 'home', label: t.tabs.home, icon: Sprout },
    { id: 'predict', label: t.tabs.predict, icon: Sparkles },
    { id: 'whatif', label: t.tabs.whatif, icon: Sliders, badge: 'Hero' },
    { id: 'compare', label: t.tabs.compare, icon: BarChart3 },
    { id: 'trends', label: t.tabs.trends, icon: TrendingUp },
    { id: 'recommendations', label: t.tabs.recommendations, icon: Lightbulb },
    { id: 'impact', label: t.tabs.impact, icon: Award },
    { id: 'model', label: t.tabs.model, icon: Database }
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#fbfdfa]/95 dark:bg-[#0c1a11]/95 border-b border-emerald-900/10 dark:border-emerald-500/20 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3.5 cursor-pointer select-none group"
            onClick={() => setActiveTab('home')}
          >
            <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 via-amber-50 to-emerald-50 dark:from-[#11261a] dark:to-[#0f2015] p-1 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <img 
                src="/logo.png" 
                alt="AgriVision AI Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-800 via-green-700 to-amber-700 dark:from-emerald-300 dark:via-green-200 dark:to-amber-300 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  v1.0 Farm ML
                </span>
              </div>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/70 font-medium hidden sm:block">
                🌱 AI Crop Yield Prediction & Farm Advisory
              </p>
            </div>
          </div>

          {/* Action CTAs: Demo Mode & Controls */}
          <div className="flex items-center gap-2.5">
            {/* 2-Min Demo Mode Button */}
            <button
              onClick={onOpenDemo}
              className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs tracking-wide bg-gradient-to-r from-emerald-600 via-green-600 to-amber-600 hover:from-emerald-500 hover:via-green-500 hover:to-amber-500 text-white shadow-sm shadow-emerald-600/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              title="Launch guided interactive 2-minute demo"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{t.actions.tryDemo}</span>
            </button>

            {/* WhatsApp Share Button */}
            <button
              onClick={onShareWhatsApp}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 hover:bg-emerald-200/80 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800/80 transition-colors"
              title="Share Advisory via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center rounded-xl bg-emerald-50 dark:bg-[#0f2015] p-1 border border-emerald-200 dark:border-emerald-800/80 text-xs font-semibold">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === 'en'
                    ? 'bg-white dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-emerald-300/70 hover:text-emerald-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === 'ta'
                    ? 'bg-white dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-emerald-300/70 hover:text-emerald-900'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLang('hi')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  lang === 'hi'
                    ? 'bg-white dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-emerald-300/70 hover:text-emerald-900'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-emerald-700 dark:text-amber-400 bg-emerald-50 dark:bg-[#0f2015] border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 transition-colors"
              title={darkMode ? "Switch to Sunlit Field Mode" : "Switch to Night Meadow Mode"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none border-t border-emerald-900/10 dark:border-emerald-500/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-xs font-bold'
                    : 'text-slate-700 dark:text-emerald-100/75 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/60 hover:text-emerald-900 dark:hover:text-emerald-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded-md font-bold ${
                    isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
