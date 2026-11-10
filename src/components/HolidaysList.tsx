/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HolidayItem } from '../data/holidays';
import {
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NE,
  AD_MONTH_NAMES_SHORT,
  toDevanagariDigits,
} from '../data/bsData';
import { bsToAd } from '../utils/dateConverter';
import { Calendar, ChevronRight } from 'lucide-react';

interface HolidaysListProps {
  year: number;
  month: number;
  holidays: HolidayItem[];
  language: 'en' | 'ne';
  onSelectDay: (day: number) => void;
}

export const HolidaysList: React.FC<HolidaysListProps> = ({
  year,
  month,
  holidays,
  language,
  onSelectDay,
}) => {
  const isNe = language === 'ne';
  const monthName = isNe ? BS_MONTH_NAMES_NE[month - 1] : BS_MONTH_NAMES_EN[month - 1];

  if (holidays.length === 0) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-4 text-center">
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {isNe
            ? `${monthName} महिनामा कुनै सार्वजनिक वा विशेष बिदा सूचीकृत छैन।`
            : `No official holidays listed for ${monthName}.`}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-4 transition-colors">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0B4D3A] dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {isNe ? 'यस महिनाका बिदाहरू' : 'Holidays this Month'}
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
          {isNe ? toDevanagariDigits(holidays.length) : holidays.length}
        </span>
      </div>

      <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
        {holidays.map((item) => {
          let adDateStr = '';
          try {
            const conv = bsToAd(year, month, item.day);
            const adMonth = AD_MONTH_NAMES_SHORT[conv.ad.month - 1];
            adDateStr = `${conv.ad.day} ${adMonth}`;
          } catch {
            adDateStr = '';
          }

          const isPublic = item.type === 'public';
          const isRestricted = item.type === 'restricted';
          const isCustom = item.isCustom;

          const bsDayStr = isNe ? toDevanagariDigits(item.day) : item.day;
          const adDayDisplay = isNe ? toDevanagariDigits(adDateStr) : adDateStr;

          return (
            <button
              key={item.id}
              onClick={() => onSelectDay(item.day)}
              className="w-full flex items-center justify-between py-2.5 px-2 hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-xl transition text-left group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {/* Date Badge */}
                <div
                  className={`w-11 h-11 shrink-0 rounded-xl flex flex-col items-center justify-center border text-center ${
                    isPublic
                      ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40'
                      : isRestricted
                      ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40'
                  }`}
                >
                  <span className="text-base font-black leading-none">
                    {bsDayStr}
                  </span>
                  <span className="text-[9px] font-semibold opacity-80 leading-none mt-0.5">
                    {adDayDisplay}
                  </span>
                </div>

                {/* Holiday Name & Category tag */}
                <div className="min-w-0">
                  <p
                    className={`text-sm font-bold truncate ${
                      isPublic
                        ? 'text-red-600 dark:text-red-400'
                        : isRestricted
                        ? 'text-stone-800 dark:text-stone-200'
                        : 'text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    {isNe ? item.name_ne : item.name_en}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isPublic
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                          : isRestricted
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                      }`}
                    >
                      {isPublic
                        ? isNe
                          ? 'सार्वजनिक बिदा'
                          : 'Public Holiday'
                        : isRestricted
                        ? isNe
                          ? 'सम्बन्धित समुदाय/क्षेत्र'
                          : 'Restricted'
                        : isNe
                        ? 'मेरो नोट'
                        : 'Custom Note'}
                    </span>
                    {item.category && (
                      <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 truncate">
                        • {item.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-200 shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};
