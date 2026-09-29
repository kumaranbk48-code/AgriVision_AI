import React from 'react';

interface TransitionLoaderProps {
  isVisible: boolean;
}

export function TransitionLoader({ isVisible }: TransitionLoaderProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/30 dark:bg-black/40 backdrop-blur-md transition-all duration-300">
      <div className="flex flex-col items-center p-8 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-2xl backdrop-blur-xl">
        {/* Animated Agriculture/Farmer Icon */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Tractor / Farmer SVG Animation */}
          <svg
            className="w-20 h-20 text-emerald-600 dark:text-emerald-400 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 13h2l2 3h4l2-3h6M5 13V6a2 2 0 012-2h10a2 2 0 012 2v7M9 21h6M12 17v4"
            />
            <circle cx="7" cy="17" r="2" />
            <circle cx="17" cy="17" r="2" />
          </svg>
          
          {/* Spinning sun/gear around it */}
          <svg
            className="absolute inset-0 w-32 h-32 text-yellow-500 animate-[spin_4s_linear_infinite] opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-xl font-bold text-emerald-800 dark:text-emerald-300 animate-pulse tracking-wide">
          Cultivating Insights...
        </h2>
      </div>
    </div>
  );
}
