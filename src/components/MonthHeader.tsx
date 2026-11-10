/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, Compass } from 'lucide-react';
import {
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NE,
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  AD_MONTH_NAMES_SHORT,
  toDevanagariDigits,
} from '../data/bsData';
import { bsToAd, getBsDaysInMonth } from '../utils/dateConverter';

interface MonthHeaderProps {
  currentBsYear: number;
  currentBsMonth: number;
  isCurrentMonthToday: boolean;
  language: 'en' | 'ne';
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onJumpToday: () => void;
  onOpenChangeDate: () => void;
}

export const MonthHeader: React.FC<MonthHeaderProps> = ({
  currentBsYear,
  currentBsMonth,
  isCurrentMonthToday,
  language,
  onPrevMonth,
  onNextMonth,
  onJumpToday,
  onOpenChangeDate,
}) => {
  const isNe = language === 'ne';
  const bsMonthName = isNe
    ? BS_MONTH_NAMES_NE[currentBsMonth - 1]
    : BS_MONTH_NAMES_EN[currentBsMonth - 1];

  const yearDisplay = isNe ? toDevanagariDigits(currentBsYear) : currentBsYear;

  // Compute AD month range spanned by this BS month
  const adRangeStr = React.useMemo(() => {
    try {
      const daysInMonth = getBsDaysInMonth(currentBsYear, currentBsMonth);
      const startAd = bsToAd(currentBsYear, currentBsMonth, 1);
      const endAd = bsToAd(currentBsYear, currentBsMonth, daysInMonth);

      const startMonthName = AD_MONTH_NAMES_SHORT[startAd.ad.month - 1];
      const endMonthName = AD_MONTH_NAMES_SHORT[endAd.ad.month - 1];

      if (startMonthName === endMonthName) {
        return `${startMonthName} ${startAd.ad.year}`;
      }
      if (startAd.ad.year === endAd.ad.year) {
        return `${startMonthName} / ${endMonthName} ${startAd.ad.year}`;
      }
      return `${startMonthName} ${startAd.ad.year} / ${endMonthName} ${endAd.ad.year}`;
    } catch {
      return '';
    }
  }, [currentBsYear, currentBsMonth]);

  const canGoPrev = !(currentBsYear <= MIN_BS_YEAR && currentBsMonth <= 1);
  const canGoNext = !(currentBsYear >= MAX_BS_YEAR && currentBsMonth >= 12);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        {/* Previous Month Arrow */}
        <button
          onClick={onPrevMonth}
          disabled={!canGoPrev}
          className={`p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 transition ${
            canGoPrev
              ? 'hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 cursor-pointer shadow-2xs'
              : 'opacity-30 cursor-not-allowed'
          }`}
          title="Previous Month"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Month & Year Title - Tappable to open date picker */}
        <button
          onClick={onOpenChangeDate}
          className="flex flex-col items-center px-3 py-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/80 transition active:scale-98 group cursor-pointer"
          title="Tap to change month or jump to date"
          aria-label="Change month or year"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight group-hover:text-[#0B4D3A] dark:group-hover:text-emerald-400 transition">
              {bsMonthName} {yearDisplay}
            </span>
            <Compass className="w-4 h-4 text-stone-400 group-hover:text-[#0B4D3A] dark:group-hover:text-emerald-400 transition" />
          </div>
          {adRangeStr && (
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              {adRangeStr}
            </span>
          )}
        </button>

        {/* Next Month Arrow */}
        <button
          onClick={onNextMonth}
          disabled={!canGoNext}
          className={`p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 transition ${
            canGoNext
              ? 'hover:bg-stone-100 dark:hover:bg-stone-800 active:scale-95 cursor-pointer shadow-2xs'
              : 'opacity-30 cursor-not-allowed'
          }`}
          title="Next Month"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Action Row: Today Button & Change Date Button */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100 dark:border-stone-800/60">
        <button
          onClick={onJumpToday}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            isCurrentMonthToday
              ? 'bg-[#0B4D3A] text-white shadow-2xs'
              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{isNe ? 'आज (Today)' : 'Today'}</span>
        </button>

        <button
          onClick={onOpenChangeDate}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
        >
          {isNe ? 'मिति खोज्नुहोस् / बदल्नुहोस्' : 'Change Date / Jump'}
        </button>
      </div>
    </div>
  );
};
