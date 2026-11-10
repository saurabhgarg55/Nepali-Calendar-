/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Globe, Info, Download, Moon, Sun, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  language: 'en' | 'ne';
  onToggleLanguage: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  isDarkMode,
  onToggleDarkMode,
  onOpenAbout,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSPrompt, setShowIOSPrompt] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo / App Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B4D3A] flex items-center justify-center text-white font-bold text-sm shadow-sm ring-1 ring-emerald-800/20">
              {language === 'ne' ? 'पात्रो' : 'BS'}
            </div>
            <div>
              <h1 className="text-base font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-tight">
                {language === 'ne' ? 'नेपाली पात्रो' : 'Nepali Calendar'}
              </h1>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium leading-none">
                {language === 'ne' ? 'बिक्रम संवत् र मिति रूपान्तरण' : 'Bikram Sambat (BS) & AD'}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                onClick={install}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md bg-[#0B4D3A] text-white hover:bg-[#08382A] active:scale-95 transition shadow-xs"
                title="Install app to home screen"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

            {!isInstalled && isIOS && (
              <button
                onClick={() => setShowIOSPrompt(true)}
                className="flex items-center gap-1 text-xs font-semibold px-2 py-1.5 rounded-md border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                title="Install on iOS"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#0B4D3A] dark:text-emerald-400" />
                <span className="hidden sm:inline">Add to Home</span>
              </button>
            )}

            {/* Language Toggle */}
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 transition"
              title={language === 'en' ? 'Switch to Nepali (नेपाली)' : 'Switch to English'}
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-[#0B4D3A] dark:text-emerald-400" />
              <span>{language === 'en' ? 'नेपाली' : 'EN'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition"
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Info / About Modal Button */}
            <button
              onClick={onOpenAbout}
              className="p-1.5 rounded-md text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 transition"
              title="About & Data Check"
              aria-label="About and data validation status"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* iOS Safari Home Screen instructions modal */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-stone-900 p-6 shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B4D3A] flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-white">
                  Add to iPhone Home Screen
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">Install as standalone app</p>
              </div>
            </div>
            <ol className="text-xs text-stone-600 dark:text-stone-300 space-y-2.5 my-4 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0B4D3A] dark:text-emerald-400">1.</span>
                <span>Tap the <strong>Share</strong> icon in Safari’s bottom toolbar.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0B4D3A] dark:text-emerald-400">2.</span>
                <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-[#0B4D3A] dark:text-emerald-400">3.</span>
                <span>Tap <strong>Add</strong> in the top-right corner.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2.5 text-xs font-semibold rounded-xl bg-[#0B4D3A] text-white hover:bg-[#08382A] transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
