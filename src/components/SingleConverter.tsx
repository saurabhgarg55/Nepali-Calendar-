/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Copy, Check, Calendar, AlertCircle } from 'lucide-react';
import { ConversionDirection } from '../utils/parser';
import {
  bsToAd,
  adToBs,
  getBsDaysInMonth,
  formatBsDate,
  formatAdDate,
  BsDate,
  AdDate,
  OutputFormat,
} from '../utils/dateConverter';
import {
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NE,
  AD_MONTH_NAMES_FULL,
  WEEKDAYS_FULL_EN,
  WEEKDAYS_FULL_NE,
  toDevanagariDigits,
} from '../data/bsData';

interface SingleConverterProps {
  language: 'en' | 'ne';
  todayBs: BsDate;
  todayAd: AdDate;
}

export const SingleConverter: React.FC<SingleConverterProps> = ({
  language,
  todayBs,
  todayAd,
}) => {
  const isNe = language === 'ne';
  const [direction, setDirection] = useState<ConversionDirection>('AD_TO_BS');

  // Input states
  const [adYear, setAdYear] = useState<number>(todayAd.year);
  const [adMonth, setAdMonth] = useState<number>(todayAd.month);
  const [adDay, setAdDay] = useState<number>(todayAd.day);

  const [bsYear, setBsYear] = useState<number>(todayBs.year);
  const [bsMonth, setBsMonth] = useState<number>(todayBs.month);
  const [bsDay, setBsDay] = useState<number>(todayBs.day);

  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Result state
  const conversionResult = React.useMemo(() => {
    setErrorMsg('');
    try {
      if (direction === 'AD_TO_BS') {
        const res = adToBs(adYear, adMonth, adDay);
        return {
          formatted: formatBsDate(res.bs, 'DD_Month_YYYY', isNe),
          weekday: isNe ? WEEKDAYS_FULL_NE[res.bs.weekday] : WEEKDAYS_FULL_EN[res.bs.weekday],
          fullText: `${res.bs.year}-${String(res.bs.month).padStart(2, '0')}-${String(res.bs.day).padStart(2, '0')} (${formatBsDate(res.bs, 'DD_Month_YYYY', false)})`,
          standard: `${formatBsDate(res.bs, 'DD_Month_YYYY', isNe)}`,
          bs: res.bs,
          ad: res.ad,
        };
      } else {
        const res = bsToAd(bsYear, bsMonth, bsDay);
        return {
          formatted: formatAdDate(res.ad, 'DD_Month_YYYY', isNe),
          weekday: isNe ? WEEKDAYS_FULL_NE[res.ad.weekday] : WEEKDAYS_FULL_EN[res.ad.weekday],
          fullText: `${res.ad.year}-${String(res.ad.month).padStart(2, '0')}-${String(res.ad.day).padStart(2, '0')}`,
          standard: `${formatAdDate(res.ad, 'DD_Month_YYYY', isNe)}`,
          bs: res.bs,
          ad: res.ad,
        };
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Date out of supported range (BS 2000 to 2084).');
      return null;
    }
  }, [direction, adYear, adMonth, adDay, bsYear, bsMonth, bsDay, isNe]);

  const handleCopy = () => {
    if (!conversionResult) return;
    navigator.clipboard.writeText(conversionResult.standard);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'AD_TO_BS' ? 'BS_TO_AD' : 'AD_TO_BS'));
  };

  // Clamp days if month changes
  useEffect(() => {
    if (direction === 'BS_TO_AD') {
      const maxDays = getBsDaysInMonth(bsYear, bsMonth);
      if (bsDay > maxDays && maxDays > 0) {
        setBsDay(maxDays);
      }
    }
  }, [bsYear, bsMonth, bsDay, direction]);

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-5 sm:p-6 transition-colors">
      {/* Header and Direction Toggle */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#0B4D3A] dark:text-emerald-400" />
          <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
            {isNe ? 'एकल मिति रूपान्तरण' : 'Single Date Converter'}
          </h2>
        </div>

        {/* Direction Switch button */}
        <button
          onClick={toggleDirection}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0B4D3A] dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>{direction === 'AD_TO_BS' ? 'AD → BS' : 'BS → AD'}</span>
        </button>
      </div>

      {/* Date Inputs */}
      {direction === 'AD_TO_BS' ? (
        <div className="space-y-2 mb-4">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            {isNe ? 'अंग्रेजी मिति छान्नुहोस् (AD)' : 'Select Gregorian (AD) Date'}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* AD Day */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                {isNe ? 'दिन' : 'Day'}
              </label>
              <select
                value={adDay}
                onChange={(e) => setAdDay(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold py-2 px-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {isNe ? toDevanagariDigits(d) : d}
                  </option>
                ))}
              </select>
            </div>

            {/* AD Month */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                {isNe ? 'महिना' : 'Month'}
              </label>
              <select
                value={adMonth}
                onChange={(e) => setAdMonth(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold py-2 px-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                {AD_MONTH_NAMES_FULL.map((name, i) => (
                  <option key={name} value={i + 1}>
                    {name} ({i + 1})
                  </option>
                ))}
              </select>
            </div>

            {/* AD Year */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                {isNe ? 'वर्ष' : 'Year'}
              </label>
              <input
                type="number"
                min={1943}
                max={2028}
                value={adYear}
                onChange={(e) => setAdYear(parseInt(e.target.value, 10) || 1943)}
                className="w-full text-xs font-bold py-2 px-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
            {isNe ? 'बिक्रम संवत् मिति छान्नुहोस् (BS)' : 'Select Bikram Sambat (BS) Date'}
          </span>
          <div className="grid grid-cols-3 gap-2">
            {/* BS Day */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                {isNe ? 'दिन' : 'Day'}
              </label>
              <select
                value={bsDay}
                onChange={(e) => setBsDay(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold py-2 px-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                {Array.from(
                  { length: getBsDaysInMonth(bsYear, bsMonth) || 30 },
                  (_, i) => i + 1
                ).map((d) => (
                  <option key={d} value={d}>
                    {isNe ? toDevanagariDigits(d) : d}
                  </option>
                ))}
              </select>
            </div>

            {/* BS Month */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                {isNe ? 'महिना' : 'Month'}
              </label>
              <select
                value={bsMonth}
                onChange={(e) => setBsMonth(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold py-2 px-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {isNe ? BS_MONTH_NAMES_NE[m - 1] : BS_MONTH_NAMES_EN[m - 1]} ({isNe ? toDevanagariDigits(m) : m})
                  </option>
                ))}
              </select>
            </div>

            {/* BS Year */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-500 mb-0.5">
                {isNe ? 'वर्ष (BS)' : 'Year (BS)'}
              </label>
              <select
                value={bsYear}
                onChange={(e) => setBsYear(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold py-2 px-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                {Array.from(
                  { length: MAX_BS_YEAR - MIN_BS_YEAR + 1 },
                  (_, i) => MIN_BS_YEAR + i
                ).map((y) => (
                  <option key={y} value={y}>
                    {isNe ? toDevanagariDigits(y) : y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Result Display Box */}
      {errorMsg ? (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      ) : conversionResult ? (
        <div className="relative overflow-hidden rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 sm:p-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800 dark:text-emerald-400">
              {direction === 'AD_TO_BS'
                ? isNe
                  ? 'रूपान्तरित बिक्रम संवत् मिति'
                  : 'CONVERTED BIKRAM SAMBAT DATE'
                : isNe
                ? 'रूपान्तरित अंग्रेजी मिति'
                : 'CONVERTED GREGORIAN DATE'}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 mt-1 leading-tight">
              {conversionResult.formatted}
            </p>
            <p className="text-xs font-bold text-[#0B4D3A] dark:text-emerald-400 mt-0.5">
              {conversionResult.weekday}
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-200 text-xs font-bold transition active:scale-95 cursor-pointer"
            title="Copy date"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">{isNe ? 'कपि भयो' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>{isNe ? 'कपि' : 'Copy'}</span>
              </>
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
};
