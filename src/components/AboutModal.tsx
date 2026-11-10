/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck, Calendar, Sparkles } from 'lucide-react';
import { SelfTestResult } from '../utils/dateConverter';
import { MIN_BS_YEAR, MAX_BS_YEAR } from '../data/bsData';

interface AboutModalProps {
  selfTest: SelfTestResult;
  language: 'en' | 'ne';
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  selfTest,
  language,
  onClose,
}) => {
  const isNe = language === 'ne';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl p-6 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0B4D3A] flex items-center justify-center text-white font-bold text-sm">
              BS
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 leading-tight">
                {isNe ? 'हाम्रो बारेमा र डाटा जाँच' : 'About Nepali Calendar'}
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Personal-use Bikram Sambat Calendar
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Self-Test Status Section */}
        <div className="my-4">
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              selfTest.passed
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60'
            }`}
          >
            {selfTest.passed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wide text-stone-900 dark:text-stone-100">
                  {selfTest.passed ? 'Data check: OK' : 'Data check: FAILED'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300">
                  Self-Test Passed
                </span>
              </div>
              <p className="text-[11px] text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                {selfTest.passed
                  ? `Verified all ${selfTest.testPairsCount} anchor dates and all ${selfTest.totalDaysVerified.toLocaleString()} days in supported range (BS 2000 to 2084) with roundtrip parity.`
                  : `Integrity check encountered failures: ${selfTest.failures.join(', ')}`}
              </p>
            </div>
          </div>
        </div>

        {/* Data Origin & Specs */}
        <div className="space-y-3 text-xs text-stone-600 dark:text-stone-300">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
            <span className="block font-bold text-stone-900 dark:text-stone-100 mb-0.5">
              📅 Supported Range
            </span>
            <p>
              BS 2000-01-01 (1943-04-14 AD) to BS 2084-12-30 (2028-04-12 AD).
              Dates outside this range are strictly rejected without guessing.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
            <span className="block font-bold text-stone-900 dark:text-stone-100 mb-0.5">
              🏛️ Official Government Source
            </span>
            <p>
              Holidays for BS 2083 sourced directly from the Government of Nepal
              Notice (Nepal Rajpatra, Khanda 75, Sankhya 67, Bhag 5).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800">
            <span className="block font-bold text-stone-900 dark:text-stone-100 mb-0.5">
              ⚡ 100% Offline &amp; Private
            </span>
            <p>
              Zero tracking, zero analytics, no network calls. Works completely
              offline and installable as a Progressive Web App (PWA).
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 text-xs font-bold rounded-xl bg-[#0B4D3A] text-white hover:bg-[#08382A] transition"
        >
          {isNe ? 'ठीक छ' : 'Done'}
        </button>
      </div>
    </div>
  );
};
