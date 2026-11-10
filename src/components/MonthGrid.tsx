/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  WEEKDAYS_EN,
  WEEKDAYS_NE,
  AD_MONTH_NAMES_SHORT,
  toDevanagariDigits,
} from '../data/bsData';
import { bsToAd, getBsDaysInMonth, BsDate } from '../utils/dateConverter';
import { HolidayItem } from '../data/holidays';

interface MonthGridProps {
  year: number;
  month: number;
  todayBs: BsDate;
  selectedDay: number | null;
  holidays: HolidayItem[];
  language: 'en' | 'ne';
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export const MonthGrid: React.FC<MonthGridProps> = ({
  year,
  month,
  todayBs,
  selectedDay,
  holidays,
  language,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
}) => {
  const isNe = language === 'ne';
  const weekdays = isNe ? WEEKDAYS_NE : WEEKDAYS_EN;
  const daysInMonth = getBsDaysInMonth(year, month);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe if deltaX is significantly larger than vertical deltaY
    if (Math.abs(diffX) > 48 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX > 0) {
        onPrevMonth(); // Swiped right -> go to previous month
      } else {
        onNextMonth(); // Swiped left -> go to next month
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Precompute calendar day items
  const calendarCells = React.useMemo(() => {
    const cells = [];
    if (daysInMonth <= 0) return [];

    // Find weekday of day 1
    const firstDayAd = bsToAd(year, month, 1);
    const startWeekday = firstDayAd.ad.weekday; // 0 = Sun, 6 = Sat

    // Add empty leading cells
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ isEmpty: true, id: `empty-${i}` });
    }

    let prevAdMonth: number | null = null;

    for (let d = 1; d <= daysInMonth; d++) {
      const conv = bsToAd(year, month, d);
      const isSat = conv.ad.weekday === 6;
      const isToday =
        year === todayBs.year && month === todayBs.month && d === todayBs.day;
      const isSelected = selectedDay === d;

      // Check holidays for this day
      const dayHolidays = holidays.filter((h) => h.day === d);
      const hasPublic = dayHolidays.some((h) => h.type === 'public');
      const hasRestricted = dayHolidays.some((h) => h.type === 'restricted');
      const hasCustom = dayHolidays.some((h) => h.isCustom);

      // Determine AD label: show month name if it's day 1 of month or AD month changed
      const currentAdMonth = conv.ad.month;
      const showAdMonth = d === 1 || (prevAdMonth !== null && prevAdMonth !== currentAdMonth) || conv.ad.day === 1;
      prevAdMonth = currentAdMonth;

      const adMonthShort = AD_MONTH_NAMES_SHORT[currentAdMonth - 1];
      const adLabel = showAdMonth
        ? `${conv.ad.day} ${adMonthShort}`
        : `${conv.ad.day}`;

      cells.push({
        isEmpty: false,
        id: `day-${d}`,
        day: d,
        weekday: conv.ad.weekday,
        adDay: conv.ad.day,
        adMonth: currentAdMonth,
        adLabel,
        isSaturday: isSat,
        isToday,
        isSelected,
        hasPublicHoliday: hasPublic,
        hasRestrictedHoliday: hasRestricted,
        hasCustomNote: hasCustom,
        holidayCount: dayHolidays.length,
      });
    }

    return cells;
  }, [year, month, daysInMonth, todayBs, selectedDay, holidays]);

  return (
    <div
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-2 sm:p-3 select-none transition-colors"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Weekday headers: Sun .. Sat */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1 pb-1 border-b border-stone-100 dark:border-stone-800">
        {weekdays.map((wd, index) => {
          const isSat = index === 6;
          return (
            <div
              key={wd}
              className={`py-1 text-xs font-bold ${
                isSat ? 'text-red-600 dark:text-red-400' : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {wd}
            </div>
          );
        })}
      </div>

      {/* Grid cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((cell) => {
          if (cell.isEmpty) {
            return (
              <div
                key={cell.id}
                className="h-14 sm:h-16 rounded-xl bg-stone-50/50 dark:bg-stone-800/10 pointer-events-none"
              />
            );
          }

          const {
            day,
            isSaturday,
            isToday,
            isSelected,
            hasPublicHoliday,
            hasRestrictedHoliday,
            hasCustomNote,
            adLabel,
          } = cell;

          // Number Color Rule:
          // Today: Dark green circle with white number
          // Saturdays: Red
          // Public holidays: Red
          // Restricted: Normal number + orange dot
          let numberColorClass = 'text-stone-900 dark:text-stone-100';
          if (isToday) {
            numberColorClass = 'text-white';
          } else if (isSaturday || hasPublicHoliday) {
            numberColorClass = 'text-red-600 dark:text-red-400';
          }

          const dayNumberDisplay = isNe ? toDevanagariDigits(day!) : day;

          return (
            <button
              key={cell.id}
              onClick={() => onSelectDay(day!)}
              className={`relative h-14 sm:h-16 rounded-xl flex flex-col items-center justify-between py-1 px-0.5 transition cursor-pointer group active:scale-95 ${
                isToday
                  ? 'bg-[#0B4D3A] shadow-md ring-2 ring-[#0B4D3A]/30 text-white'
                  : isSelected
                  ? 'ring-2 ring-[#0B4D3A] dark:ring-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'hover:bg-stone-100 dark:hover:bg-stone-800/70'
              }`}
              title={`BS ${day}/${month}/${year}`}
            >
              {/* BS Day Number (BIG) */}
              <div className="flex items-center justify-center pt-0.5">
                <span
                  className={`text-base sm:text-lg font-black tracking-tight leading-none ${numberColorClass}`}
                >
                  {dayNumberDisplay}
                </span>
              </div>

              {/* Status Indicator Dots */}
              <div className="flex items-center gap-0.5 h-1.5">
                {hasPublicHoliday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isToday ? 'bg-amber-300 ring-1 ring-white' : 'bg-red-500'
                    }`}
                    title="Public Holiday"
                  />
                )}
                {hasRestrictedHoliday && !hasPublicHoliday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isToday ? 'bg-amber-300 ring-1 ring-white' : 'bg-amber-500'
                    }`}
                    title="Restricted Holiday"
                  />
                )}
                {hasCustomNote && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isToday ? 'bg-white ring-1 ring-emerald-300' : 'bg-emerald-600 dark:bg-emerald-400'
                    }`}
                    title="Personal Note / Custom Holiday"
                  />
                )}
              </div>

              {/* AD Day Number / Month Abbreviation (small underneath) */}
              <div className="w-full text-center overflow-hidden px-0.5">
                <span
                  className={`text-[10px] sm:text-[11px] font-semibold leading-none block truncate ${
                    isToday
                      ? 'text-emerald-100'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {isNe
                    ? toDevanagariDigits(adLabel || '')
                    : adLabel || ''}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
