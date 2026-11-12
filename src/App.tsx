/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { TodayCard } from './components/TodayCard';
import { MonthHeader } from './components/MonthHeader';
import { MonthGrid } from './components/MonthGrid';
import { HolidaysList } from './components/HolidaysList';
import { DayDetailModal } from './components/DayDetailModal';
import { ChangeDateModal } from './components/ChangeDateModal';
import { SingleConverter } from './components/SingleConverter';
import { BulkConverter } from './components/BulkConverter';
import { AboutModal } from './components/AboutModal';
import { SelfTestBanner } from './components/SelfTestBanner';
import { useOnlineStatus } from './hooks/useOnlineStatus';

import {
  bsToAd,
  adToBs,
  runSelfTest,
  BsDate,
  AdDate,
} from './utils/dateConverter';
import {
  getHolidaysForBsMonth,
  HolidayItem,
} from './data/holidays';
import { MIN_BS_YEAR, MAX_BS_YEAR } from './data/bsData';
import { Calendar, ArrowLeftRight, WifiOff } from 'lucide-react';

import { safeLocalStorage } from './utils/storage';

const STORAGE_KEY_LANG = 'nepali_calendar_lang';
const STORAGE_KEY_DARK_MODE = 'nepali_calendar_dark_mode';

// Helper to get local device's current date as AD year, month, day
function getDeviceTodayAd(): AdDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    weekday: now.getDay(),
  };
}

export default function App() {
  // 1. Run Data Self-Test on startup
  const selfTestResult = useMemo(() => runSelfTest(), []);

  // 2. Language & Dark Mode preferences
  const [language, setLanguage] = useState<'en' | 'ne'>(() => {
    return (safeLocalStorage.getItem(STORAGE_KEY_LANG) as 'en' | 'ne') || 'en';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = safeLocalStorage.getItem(STORAGE_KEY_DARK_MODE);
    if (saved !== null) return saved === 'true';
    try {
      return typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEY_LANG, language);
  }, [language]);

  useEffect(() => {
    safeLocalStorage.setItem(STORAGE_KEY_DARK_MODE, String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Online / Offline monitor
  const isOnline = useOnlineStatus();

  // Active Screen Tab: 'calendar' | 'converter'
  const [activeTab, setActiveTab] = useState<'calendar' | 'converter'>('calendar');

  // Converter sub-tab: 'single' | 'bulk'
  const [converterMode, setConverterMode] = useState<'single' | 'bulk'>('single');

  // Modals
  const [showAbout, setShowAbout] = useState(false);
  const [showChangeDate, setShowChangeDate] = useState(false);
  const [selectedDayForSheet, setSelectedDayForSheet] = useState<number | null>(null);

  // 3. Current Today state (refreshes on window focus or reopen)
  const [todayAd, setTodayAd] = useState<AdDate>(getDeviceTodayAd);

  // Compute Today in BS
  const todayBs = useMemo<BsDate>(() => {
    try {
      const conv = adToBs(todayAd.year, todayAd.month, todayAd.day);
      return conv.bs;
    } catch {
      // Fallback within supported range if device clock is unusually out of bounds
      return { year: 2083, month: 7, day: 22, weekday: 0 };
    }
  }, [todayAd]);

  // Refresh today on window focus / visibility change
  useEffect(() => {
    const updateToday = () => {
      setTodayAd(getDeviceTodayAd());
    };
    window.addEventListener('focus', updateToday);
    document.addEventListener('visibilitychange', updateToday);
    return () => {
      window.removeEventListener('focus', updateToday);
      document.removeEventListener('visibilitychange', updateToday);
    };
  }, []);

  // 4. Calendar viewing state: year & month
  const [viewYear, setViewYear] = useState<number>(todayBs.year);
  const [viewMonth, setViewMonth] = useState<number>(todayBs.month);
  const [selectedGridDay, setSelectedGridDay] = useState<number | null>(null);

  // Holiday refresh token (when user adds/deletes custom notes)
  const [holidayRefreshKey, setHolidayRefreshKey] = useState(0);

  // Month holidays for current view
  const monthHolidays = useMemo<HolidayItem[]>(() => {
    return getHolidaysForBsMonth(viewYear, viewMonth);
  }, [viewYear, viewMonth, holidayRefreshKey]);

  // Today's holidays
  const todayHolidays = useMemo<HolidayItem[]>(() => {
    const holidaysInCurrentMonth = getHolidaysForBsMonth(todayBs.year, todayBs.month);
    return holidaysInCurrentMonth.filter((h) => h.day === todayBs.day);
  }, [todayBs, holidayRefreshKey]);

  // Navigation handlers
  const handlePrevMonth = useCallback(() => {
    if (viewYear <= MIN_BS_YEAR && viewMonth <= 1) return;
    if (viewMonth === 1) {
      setViewYear((prev) => prev - 1);
      setViewMonth(12);
    } else {
      setViewMonth((prev) => prev - 1);
    }
    setSelectedGridDay(null);
  }, [viewYear, viewMonth]);

  const handleNextMonth = useCallback(() => {
    if (viewYear >= MAX_BS_YEAR && viewMonth >= 12) return;
    if (viewMonth === 12) {
      setViewYear((prev) => prev + 1);
      setViewMonth(1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
    setSelectedGridDay(null);
  }, [viewYear, viewMonth]);

  const handleJumpToday = useCallback(() => {
    setViewYear(todayBs.year);
    setViewMonth(todayBs.month);
    setSelectedGridDay(todayBs.day);
  }, [todayBs]);

  const handleSelectDay = (day: number) => {
    setSelectedGridDay(day);
    setSelectedDayForSheet(day);
  };

  const isCurrentMonthToday =
    viewYear === todayBs.year && viewMonth === todayBs.month;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors pb-24 sm:pb-20">
      {/* Self-Test Critical Error Banner */}
      <SelfTestBanner selfTest={selfTestResult} />

      {/* Top Navbar */}
      <Navbar
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'en' ? 'ne' : 'en'))}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((d) => !d)}
        onOpenAbout={() => setShowAbout(true)}
      />

      {/* Offline Toast */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-1 px-4 flex items-center justify-center gap-1.5 shadow-xs">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Offline Mode — All calendar functions and converters work locally without internet.</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 py-4 space-y-4">
        {activeTab === 'calendar' ? (
          <>
            {/* Screen 1: Calendar View */}
            {/* 1. Big Today Card */}
            <TodayCard
              todayBs={todayBs}
              todayAd={todayAd}
              holidays={todayHolidays}
              language={language}
              onTapToday={() => {
                setViewYear(todayBs.year);
                setViewMonth(todayBs.month);
                handleSelectDay(todayBs.day);
              }}
            />

            {/* 2. Month Navigation Header */}
            <MonthHeader
              currentBsYear={viewYear}
              currentBsMonth={viewMonth}
              isCurrentMonthToday={isCurrentMonthToday}
              language={language}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              onJumpToday={handleJumpToday}
              onOpenChangeDate={() => setShowChangeDate(true)}
            />

            {/* 3. Full Month Grid (Sun..Sat, swipeable) */}
            <MonthGrid
              year={viewYear}
              month={viewMonth}
              todayBs={todayBs}
              selectedDay={selectedGridDay}
              holidays={monthHolidays}
              language={language}
              onSelectDay={handleSelectDay}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
            />

            {/* 4. Holidays List below Grid */}
            <HolidaysList
              year={viewYear}
              month={viewMonth}
              holidays={monthHolidays}
              language={language}
              onSelectDay={handleSelectDay}
            />
          </>
        ) : (
          <>
            {/* Screen 2: Converter View */}
            {/* Converter Segmented Control */}
            <div className="flex bg-stone-200/70 dark:bg-stone-800/80 p-1 rounded-2xl">
              <button
                onClick={() => setConverterMode('single')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  converterMode === 'single'
                    ? 'bg-white dark:bg-stone-900 text-[#0B4D3A] dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {language === 'ne' ? 'एकल मिति रूपान्तरण' : 'Single Date Converter'}
              </button>
              <button
                onClick={() => setConverterMode('bulk')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                  converterMode === 'bulk'
                    ? 'bg-white dark:bg-stone-900 text-[#0B4D3A] dark:text-emerald-400 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {language === 'ne' ? 'एक्सेल बल्क रूपान्तरण' : 'Bulk Converter (Excel)'}
              </button>
            </div>

            {converterMode === 'single' ? (
              <SingleConverter
                language={language}
                todayBs={todayBs}
                todayAd={todayAd}
              />
            ) : (
              <BulkConverter language={language} />
            )}
          </>
        )}
      </main>

      {/* Persistent Bottom Tab Navigation: Calendar | Converter */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-4 py-2">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
          {/* Calendar Tab */}
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'calendar'
                ? 'text-[#0B4D3A] dark:text-emerald-400 font-bold bg-emerald-50/70 dark:bg-emerald-950/40'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 font-medium'
            }`}
          >
            <Calendar className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-none">
              {language === 'ne' ? 'पात्रो (Calendar)' : 'Calendar'}
            </span>
          </button>

          {/* Converter Tab */}
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'converter'
                ? 'text-[#0B4D3A] dark:text-emerald-400 font-bold bg-emerald-50/70 dark:bg-emerald-950/40'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 font-medium'
            }`}
          >
            <ArrowLeftRight className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] leading-none">
              {language === 'ne' ? 'कन्भर्टर (Converter)' : 'Converter'}
            </span>
          </button>
        </div>
      </nav>

      {/* Modals and Sheets */}
      {/* 1. Day Detail Modal & Custom Notes */}
      {selectedDayForSheet !== null && (
        <DayDetailModal
          year={viewYear}
          month={viewMonth}
          day={selectedDayForSheet}
          language={language}
          onClose={() => setSelectedDayForSheet(null)}
          onRefreshHolidays={() => setHolidayRefreshKey((k) => k + 1)}
        />
      )}

      {/* 2. Change Date / Jump Modal */}
      {showChangeDate && (
        <ChangeDateModal
          currentYear={viewYear}
          currentMonth={viewMonth}
          language={language}
          onClose={() => setShowChangeDate(false)}
          onSelectMonthYear={(year, month, day) => {
            setViewYear(year);
            setViewMonth(month);
            if (day) {
              setSelectedGridDay(day);
              setSelectedDayForSheet(day);
            } else {
              setSelectedGridDay(null);
            }
          }}
        />
      )}

      {/* 3. About & Data Check Modal */}
      {showAbout && (
        <AboutModal
          selfTest={selfTestResult}
          language={language}
          onClose={() => setShowAbout(false)}
        />
      )}
    </div>
  );
}
