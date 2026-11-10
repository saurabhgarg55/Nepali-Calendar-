/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BsDate, AdDate } from '../utils/dateConverter';
import {
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NE,
  WEEKDAYS_FULL_EN,
  WEEKDAYS_FULL_NE,
  AD_MONTH_NAMES_SHORT,
  toDevanagariDigits,
} from '../data/bsData';
import { HolidayItem } from '../data/holidays';
import { Sparkles, CalendarDays } from 'lucide-react';

interface TodayCardProps {
  todayBs: BsDate;
  todayAd: AdDate;
  holidays: HolidayItem[];
  language: 'en' | 'ne';
  onTapToday?: () => void;
}

export const TodayCard: React.FC<TodayCardProps> = ({
  todayBs,
  todayAd,
  holidays,
  language,
  onTapToday,
}) => {
  const isNe = language === 'ne';
  const bsMonthName = isNe
    ? BS_MONTH_NAMES_NE[todayBs.month - 1]
    : BS_MONTH_NAMES_EN[todayBs.month - 1];
  const weekdayName = isNe
    ? WEEKDAYS_FULL_NE[todayBs.weekday]
    : WEEKDAYS_FULL_EN[todayBs.weekday];
  const adMonthName = AD_MONTH_NAMES_SHORT[todayAd.month - 1];

  const bsDayDisplay = isNe ? toDevanagariDigits(todayBs.day) : todayBs.day;
  const bsYearDisplay = isNe ? toDevanagariDigits(todayBs.year) : todayBs.year;
  const adDayDisplay = isNe ? toDevanagariDigits(todayAd.day) : todayAd.day;
  const adYearDisplay = isNe ? toDevanagariDigits(todayAd.year) : todayAd.year;

  // Filter public and restricted holidays today
  const primaryHoliday = holidays.find((h) => h.type === 'public') || holidays[0];

  return (
    <div
      onClick={onTapToday}
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-stone-900 border border-emerald-900/10 dark:border-emerald-800/20 shadow-sm p-4 sm:p-5 transition hover:shadow-md cursor-pointer group"
      role="button"
      tabIndex={0}
      title="Tap for day details"
    >
      {/* Decorative subtle background tint */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#0B4D3A]/5 dark:bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

      <div className="flex items-center justify-between gap-4">
        {/* Left: Big Today BS Day Number */}
        <div className="flex items-baseline gap-3.5">
          <div className="flex flex-col items-center justify-center min-w-[72px] sm:min-w-[80px] py-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400">
              {isNe ? 'आज' : 'TODAY'}
            </span>
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#0B4D3A] dark:text-emerald-400 leading-none my-0.5">
              {bsDayDisplay}
            </span>
            <span className="text-[11px] font-semibold text-stone-600 dark:text-stone-300">
              {bsMonthName}
            </span>
          </div>

          {/* Center Info: BS Month Year, Weekday, AD Date */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                {bsMonthName} {bsYearDisplay}
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-[#0B4D3A]/10 text-[#0B4D3A] dark:bg-emerald-900/40 dark:text-emerald-300">
                BS
              </span>
            </div>

            <p className="text-sm font-semibold text-[#0B4D3A] dark:text-emerald-400 mt-0.5">
              {weekdayName}
            </p>

            {/* AD date row */}
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500" />
              <span>
                {adDayDisplay} {adMonthName} {adYearDisplay} <span className="text-[10px] text-stone-400 uppercase font-bold">AD</span>
              </span>
            </p>
          </div>
        </div>

        {/* Right Holiday indicator if today is holiday */}
        {primaryHoliday && (
          <div className="flex flex-col items-end max-w-[130px] sm:max-w-[160px] text-right">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                primaryHoliday.type === 'public'
                  ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40'
              }`}
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">{primaryHoliday.type === 'public' ? (isNe ? 'सार्वजनिक बिदा' : 'Public Holiday') : (isNe ? 'पर्व / दिवस' : 'Festival')}</span>
            </span>
            <p className="text-xs font-bold text-red-600 dark:text-red-400 mt-1 line-clamp-2 leading-tight">
              {isNe ? primaryHoliday.name_ne : primaryHoliday.name_en}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
