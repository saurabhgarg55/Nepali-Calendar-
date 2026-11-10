/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Search, Calendar, ArrowRight } from 'lucide-react';
import {
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NE,
  toDevanagariDigits,
} from '../data/bsData';
import { parseBsInput, parseAdInput } from '../utils/parser';
import { adToBs, isValidBsDate } from '../utils/dateConverter';

interface ChangeDateModalProps {
  currentYear: number;
  currentMonth: number;
  language: 'en' | 'ne';
  onClose: () => void;
  onSelectMonthYear: (year: number, month: number, day?: number) => void;
}

export const ChangeDateModal: React.FC<ChangeDateModalProps> = ({
  currentYear,
  currentMonth,
  language,
  onClose,
  onSelectMonthYear,
}) => {
  const isNe = language === 'ne';
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  // Free-form Go to Date field
  const [inputType, setInputType] = useState<'BS' | 'AD'>('BS');
  const [rawDateInput, setRawDateInput] = useState<string>('');
  const [parseError, setParseError] = useState<string>('');

  const years = Array.from(
    { length: MAX_BS_YEAR - MIN_BS_YEAR + 1 },
    (_, i) => MIN_BS_YEAR + i
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleApplyDropdown = () => {
    onSelectMonthYear(selectedYear, selectedMonth);
    onClose();
  };

  const handleApplyTypedDate = (e: React.FormEvent) => {
    e.preventDefault();
    setParseError('');

    if (!rawDateInput.trim()) {
      setParseError(isNe ? 'कृपया मिति प्रविष्ट गर्नुहोस्।' : 'Please enter a date.');
      return;
    }

    if (inputType === 'BS') {
      const parsed = parseBsInput(rawDateInput, 'DMY');
      if (!parsed) {
        setParseError(
          isNe
            ? 'अमान्य वा दायरा बाहिरको बिक्रम संवत् मिति (२००० देखि २०८४)।'
            : 'Invalid or out-of-range BS date (BS 2000 to 2084).'
        );
        return;
      }
      onSelectMonthYear(parsed.year, parsed.month, parsed.day);
      onClose();
    } else {
      // AD input
      const parsed = parseAdInput(rawDateInput, 'DMY');
      if (!parsed) {
        setParseError(isNe ? 'अमान्य अंग्रेजी मिति।' : 'Invalid Gregorian (AD) date.');
        return;
      }
      try {
        const conv = adToBs(parsed.year, parsed.month, parsed.day);
        onSelectMonthYear(conv.bs.year, conv.bs.month, conv.bs.day);
        onClose();
      } catch (err: any) {
        setParseError(err.message || 'Date out of supported range.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 animate-in fade-in zoom-in-95">
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0B4D3A] dark:text-emerald-400" />
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {isNe ? 'मिति चयन / खोज्नुहोस्' : 'Change Date / Jump'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Quick Year & Month Selectors */}
        <div className="my-4">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
            {isNe ? '१. महिना र वर्ष चयन गर्नुहोस्' : '1. Select Month & Year (BS)'}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <span className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                {isNe ? 'वर्ष (BS)' : 'Year (BS)'}
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0B4D3A]"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {isNe ? toDevanagariDigits(y) : y} BS
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400 mb-1">
                {isNe ? 'महिना' : 'Month'}
              </span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0B4D3A]"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {isNe ? BS_MONTH_NAMES_NE[m - 1] : BS_MONTH_NAMES_EN[m - 1]} ({isNe ? toDevanagariDigits(m) : m})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleApplyDropdown}
            className="w-full mt-3 py-2 text-xs font-bold rounded-xl bg-[#0B4D3A] text-white hover:bg-[#08382A] transition"
          >
            {isNe ? 'यो महिना देखाउनुहोस्' : 'View This Month'}
          </button>
        </div>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-stone-200 dark:border-stone-800" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold">
            <span className="bg-white dark:bg-stone-900 px-2 text-stone-400">
              {isNe ? 'वा सीधै मिति टाइप गर्नुहोस्' : 'OR TYPE FULL DATE'}
            </span>
          </div>
        </div>

        {/* Section 2: Go to full date input */}
        <form onSubmit={handleApplyTypedDate} className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {isNe ? '२. कुनै पनि मितिमा जानुहोस्' : '2. Jump to Exact Date'}
            </span>

            {/* Switchable BS / AD */}
            <div className="flex rounded-lg p-0.5 bg-stone-100 dark:bg-stone-800">
              <button
                type="button"
                onClick={() => setInputType('BS')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition ${
                  inputType === 'BS'
                    ? 'bg-[#0B4D3A] text-white'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                BS
              </button>
              <button
                type="button"
                onClick={() => setInputType('AD')}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition ${
                  inputType === 'AD'
                    ? 'bg-[#0B4D3A] text-white'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                AD
              </button>
            </div>
          </div>

          <div>
            <div className="relative">
              <input
                type="text"
                value={rawDateInput}
                onChange={(e) => {
                  setRawDateInput(e.target.value);
                  setParseError('');
                }}
                placeholder={
                  inputType === 'BS'
                    ? isNe
                      ? 'जस्तै: २०८३-०७-२२ वा २२ कार्तिक २०८३'
                      : 'e.g. 2083-07-22, 22 Kartik 2083, 22/07/2083'
                    : 'e.g. 2026-11-08, 8 Nov 2026, 08/11/2026'
                }
                className="w-full text-xs font-medium py-2 px-3 pl-8 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0B4D3A]"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>

            {parseError && (
              <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 mt-1">
                {parseError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl border border-[#0B4D3A] text-[#0B4D3A] dark:text-emerald-400 dark:border-emerald-700 hover:bg-[#0B4D3A]/5 transition"
          >
            <span>{isNe ? 'मितिमा जानुहोस्' : 'Jump to Date'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
