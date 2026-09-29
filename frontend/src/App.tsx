import React, { useState, useEffect } from 'react';
import {
  Language,
  PredictionRequest,
  MetadataResponse
} from './types';
import { i18n } from './i18n';
import { fetchMetadata } from './services/api';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DemoModal } from './components/DemoModal';
import { StartupVideo } from './components/StartupVideo';
import { TransitionLoader } from './components/TransitionLoader';

import { HomePage } from './pages/HomePage';
import { PredictPage } from './pages/PredictPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { ComparePage } from './pages/ComparePage';
import { TrendsPage } from './pages/TrendsPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ImpactPage } from './pages/ImpactPage';
import { DataModelPage } from './pages/DataModelPage';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [lang, setLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [showStartupVideo, setShowStartupVideo] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Shared Farm Input State (defaulted to Ludhiana Rice)
  const [currentInputs, setCurrentInputs] = useState<PredictionRequest>({
    crop: 'Rice',
    state: 'Punjab',
    district: 'Ludhiana',
    season: 'Kharif',
    year: 2025,
    area_ha: 4.0,
    soil_type: 'Alluvial',
    soil_ph: 7.3,
    rainfall_mm: 580.0,
    avg_temp_c: 30.5,
    irrigation_type: 'Canal/Flood',
    fertilizer_n: 120.0,
    fertilizer_p: 60.0,
    fertilizer_k: 40.0
  });

  // Dark Mode Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load Metadata on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const meta = await fetchMetadata();
        setMetadata(meta);
      } catch (err) {
        console.error("Metadata load error:", err);
        setMetadata({
          crops: ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Groundnut', 'Soybean', 'Mustard', 'Gram', 'Jowar', 'Bajra', 'Barley', 'Arhar', 'Moong', 'Urad', 'Sesamum'],
          districts: ['Ludhiana', 'Karnal', 'Rajkot', 'Ahmednagar', 'Coimbatore', 'Belagavi', 'Indore', 'Varanasi', 'Patna', 'Burdwan', 'Guntur', 'Thanjavur'],
          states: ['Punjab', 'Haryana', 'Gujarat', 'Maharashtra', 'Tamil Nadu', 'Karnataka', 'Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'West Bengal', 'Andhra Pradesh'],
          seasons: ['Kharif', 'Rabi', 'Summer'],
          soils: ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy Loam', 'Clayey'],
          irrigations: ['Rainfed', 'Canal/Flood', 'Tube Well', 'Sprinkler', 'Drip'],
          district_to_state: {
            "Ludhiana": "Punjab", "Karnal": "Haryana", "Rajkot": "Gujarat", "Ahmednagar": "Maharashtra",
            "Coimbatore": "Tamil Nadu", "Belagavi": "Karnataka", "Indore": "Madhya Pradesh",
            "Varanasi": "Uttar Pradesh", "Patna": "Bihar", "Burdwan": "West Bengal",
            "Guntur": "Andhra Pradesh", "Thanjavur": "Tamil Nadu"
          },
          fertilizer_presets: {
            "Rice": { "Low": { fertilizer_n: 80, fertilizer_p: 40, fertilizer_k: 30 }, "Medium (Standard)": { fertilizer_n: 120, fertilizer_p: 60, fertilizer_k: 40 }, "High": { fertilizer_n: 160, fertilizer_p: 80, fertilizer_k: 60 } },
            "Wheat": { "Low": { fertilizer_n: 100, fertilizer_p: 40, fertilizer_k: 30 }, "Medium (Standard)": { fertilizer_n: 140, fertilizer_p: 60, fertilizer_k: 40 }, "High": { fertilizer_n: 180, fertilizer_p: 80, fertilizer_k: 60 } }
          },
          crop_suitability: {},
          ranges: {}
        });
      }
    }
    loadMeta();
  }, []);

  // WhatsApp Share Helper
  const handleShareWhatsApp = (customText?: string) => {
    const defaultText = `*AgriVision AI Advisory*\nCrop: ${currentInputs.crop} (${currentInputs.season} ${currentInputs.year})\nDistrict: ${currentInputs.district}, ${currentInputs.state}\nIrrigation: ${currentInputs.irrigation_type}\nRainfall: ${currentInputs.rainfall_mm}mm\nExplore live: https://agrivision.ai`;
    const message = encodeURIComponent(customText || defaultText);
    window.open(`https://api.whatsapp.com/send?text=${message}`, '_blank');
  };

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Wait for page to render before hiding loader
    }, 800); // 800ms loading animation duration
  };

  const handleNavigateToWhatIf = (inputs: PredictionRequest) => {
    setCurrentInputs(inputs);
    handleTabChange('whatif');
  };

  return (
    <div className="min-h-screen flex flex-col bg-farm-pattern text-slate-800 dark:text-emerald-50 transition-colors relative">
      {showStartupVideo && <StartupVideo onComplete={() => setShowStartupVideo(false)} />}
      <TransitionLoader isVisible={isTransitioning} />
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        lang={lang}
        setLang={setLang}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenDemo={() => setIsDemoOpen(true)}
        onShareWhatsApp={() => handleShareWhatsApp()}
      />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <HomePage
            onNavigate={handleTabChange}
            onOpenDemo={() => setIsDemoOpen(true)}
            lang={lang}
          />
        )}

        {activeTab === 'predict' && (
          <PredictPage
            metadata={metadata}
            onNavigateToWhatIf={handleNavigateToWhatIf}
            lang={lang}
            onShareWhatsApp={handleShareWhatsApp}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfPage
            initialInputs={currentInputs}
            metadata={metadata}
            lang={lang}
          />
        )}

        {activeTab === 'compare' && (
          <ComparePage
            metadata={metadata}
            lang={lang}
          />
        )}

        {activeTab === 'trends' && (
          <TrendsPage
            metadata={metadata}
            lang={lang}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsPage
            recommendations={[
              {
                id: 'irrig_upgrade',
                priority: 'High',
                category: 'Irrigation',
                badge: '+22.5% Yield Potential',
                impact_pct: 22.5,
                title: {
                  en: `Transition to Drip Irrigation for ${currentInputs.crop}`,
                  ta: `${currentInputs.crop} பயிருக்கு சொட்டுநீர் பாசன முறைக்கு மாறவும்`,
                  hi: `${currentInputs.crop} के लिए ड्रिप सिंचाई अपनाएं`
                },
                reason: {
                  en: `Under current seasonal rainfall (${currentInputs.rainfall_mm}mm), Drip reduces evaporative loss by 40% and preserves root-zone field capacity.`,
                  ta: `தற்போதைய மழை அளவின் கீழ் (${currentInputs.rainfall_mm}மிமீ), சொட்டுநீர் பாசனம் நீர் ஆவியாதலை 40% குறைத்து ஈரப்பதத்தை காக்கிறது.`,
                  hi: `वर्तमान वर्षा (${currentInputs.rainfall_mm} मिमी) में ड्रिप सिंचाई वाष्पीकरण को 40% कम कर जड़ क्षेत्र में नमी बनाए रखती है।`
                },
                action: {
                  en: "Apply micro-irrigation scheduling of 2-3 hours twice weekly; leverage PMKSY (Per Drop More Crop) subsidies.",
                  ta: "வாரத்திற்கு இருமுறை 2-3 மணிநேரம் சொட்டுநீர் பாசனம் செய்யவும்; அரசு மானியத்தைப் பயன்படுத்தவும்.",
                  hi: "सप्ताह में दो बार 2-3 घंटे सूक्ष्म सिंचाई करें; पीएमकेएसवाई सब्सिडी का लाभ उठाएं।"
                }
              },
              {
                id: 'fertilizer_n_boost',
                priority: 'Medium',
                category: 'Fertilizer',
                badge: '+12.0% Yield Potential',
                impact_pct: 12.0,
                title: {
                  en: `Optimize Nitrogen Application to 120 kg/ha`,
                  ta: `தழைச்சத்தை 120 கி/ஹெக் அளவிற்கு சீரமைக்கவும்`,
                  hi: `नाइट्रोजन की मात्रा 120 किग्रा/हेक्टेयर तक अनुकूलित करें`
                },
                reason: {
                  en: "Balanced nitrogen timing supports active tillering and panicle initiation without inducing lodging.",
                  ta: "சரியான தழைச்சத்து அளவு பயிரின் சீரான வளர்ச்சிக்கு உதவுகிறது.",
                  hi: "संतुलित नाइट्रोजन खुराक फसल के अच्छे विकास और बाली बनने में सहायक है।"
                },
                action: {
                  en: "Apply split-dose urea (50% basal at sowing, 25% at tillering, 25% at panicle initiation) with neem coating.",
                  ta: "பிரித்து இடப்படும் முறையில் வேப்பம் பூசிய யூரியாவை இடவும் (50% ஆரம்பம், 25% தூர்கட்டுதல், 25% கதிர் பருவம்).",
                  hi: "नीम लेपित यूरिया को तीन भागों में दें (50% बुवाई, 25% कल्ले, 25% बाली)।"
                }
              },
              {
                id: 'soil_ph_amend',
                priority: 'Low',
                category: 'Soil Health',
                badge: '+8.0% Nutrient Uptake',
                impact_pct: 8.0,
                title: {
                  en: "Soil Organic Carbon & Microbial Inoculation",
                  ta: "மண் கரிம கார்பன் மற்றும் நுண்ணுயிர் உரம்",
                  hi: "मृदा जैविक कार्बन और सूक्ष्मजीव संवर्धन"
                },
                reason: {
                  en: `Alluvial soil in ${currentInputs.district} responds strongly to biofertilizer consortium (Azospirillum + PSB).`,
                  ta: `${currentInputs.district}-ன் வண்டல் மண் நுண்ணுயிர் உரங்களுக்கு சிறந்த பலனைத் தரும்.`,
                  hi: `${currentInputs.district} की जलोढ़ मिट्टी जैव उर्वरकों के प्रति अत्यधिक संवेदनशील है।`
                },
                action: {
                  en: "Incorporate 5 tonnes/ha FYM or compost with seed treatment before sowing.",
                  ta: "ஹெக்டேருக்கு 5 டன் மக்கிய தொழு உரம் இடவும்.",
                  hi: "बुवाई से पहले प्रति हेक्टेयर 5 टन गोबर की खाद या कम्पोस्ट डालें।"
                }
              }
            ]}
            inputs={currentInputs}
            onNavigateToWhatIf={handleNavigateToWhatIf}
            lang={lang}
          />
        )}

        {activeTab === 'impact' && (
          <ImpactPage lang={lang} />
        )}

        {activeTab === 'model' && (
          <DataModelPage lang={lang} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Guided 2-Min Demo Walkthrough Modal */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onApplyScenario={handleTabChange}
        lang={lang}
      />

    </div>
  );
}

export default App;
