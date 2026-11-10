/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ArrowLeftRight,
  ClipboardPaste,
  Copy,
  Trash2,
  Check,
  AlertTriangle,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import {
  ConversionDirection,
  DateOrder,
  bulkConvert,
  BulkConversionRow,
} from '../utils/parser';
import { OutputFormat } from '../utils/dateConverter';
import { toDevanagariDigits } from '../data/bsData';

interface BulkConverterProps {
  language: 'en' | 'ne';
}

const STORAGE_KEY_DATE_ORDER = 'nepali_calendar_date_order';
const STORAGE_KEY_OUTPUT_FORMAT = 'nepali_calendar_output_format';
const STORAGE_KEY_NEPALI_DIGITS = 'nepali_calendar_nepali_digits';

const SAMPLE_EXCEL_INPUT = `08/11/2026
2026-04-14
17 Oct 2026

31/02/2026
46334`;

export const BulkConverter: React.FC<BulkConverterProps> = ({ language }) => {
  const isNe = language === 'ne';

  // State
  const [inputText, setInputText] = useState<string>('');
  const [direction, setDirection] = useState<ConversionDirection>('AD_TO_BS');

  // Persistent user preferences
  const [dateOrder, setDateOrder] = useState<DateOrder>(() => {
    return (localStorage.getItem(STORAGE_KEY_DATE_ORDER) as DateOrder) || 'DMY';
  });

  const [outputFormat, setOutputFormat] = useState<OutputFormat>(() => {
    return (
      (localStorage.getItem(STORAGE_KEY_OUTPUT_FORMAT) as OutputFormat) ||
      'DD_Month_YYYY'
    );
  });

  const [useNepaliDigits, setUseNepaliDigits] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_NEPALI_DIGITS) === 'true';
  });

  const [copied, setCopied] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DATE_ORDER, dateOrder);
  }, [dateOrder]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OUTPUT_FORMAT, outputFormat);
  }, [outputFormat]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NEPALI_DIGITS, String(useNepaliDigits));
  }, [useNepaliDigits]);

  // Bulk conversion calculation
  const { rows, stats } = React.useMemo(() => {
    return bulkConvert(inputText, direction, dateOrder, outputFormat, useNepaliDigits);
  }, [inputText, direction, dateOrder, outputFormat, useNepaliDigits]);

  // Reconstructed output text with exact lines & tabs
  const convertedText = React.useMemo(() => {
    return rows.map((r) => r.converted).join('\n');
  }, [rows]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch {
      // In case clipboard read permission is blocked, focus textarea
      const el = document.getElementById('bulk-input-area') as HTMLTextAreaElement;
      el?.focus();
    }
  };

  const handleCopy = () => {
    if (!convertedText) return;
    navigator.clipboard.writeText(convertedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputText('');
  };

  const handleLoadSample = () => {
    setDirection('AD_TO_BS');
    setDateOrder('DMY');
    setOutputFormat('DD_Month_YYYY');
    setUseNepaliDigits(false);
    setInputText(SAMPLE_EXCEL_INPUT);
  };

  const toggleDirection = () => {
    setDirection((prev) => (prev === 'AD_TO_BS' ? 'BS_TO_AD' : 'AD_TO_BS'));
  };

  const isNumericFormat =
    outputFormat === 'DD/MM/YYYY' ||
    outputFormat === 'YYYY-MM-DD' ||
    outputFormat === 'YYYY/MM/DD';

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm p-4 sm:p-6 transition-colors">
      {/* Title & Direction Bar */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-stone-800 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-[#0B4D3A] dark:text-emerald-400" />
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {isNe ? 'एक्सेल बल्क रूपान्तरण' : 'Bulk Converter for Excel'}
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              {isNe
                ? 'एक्सेलको पूरा स्तम्भ (कॉलम) पेस्ट गर्नुहोस्'
                : 'Paste a column or table straight from Excel'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleDirection}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#0B4D3A] dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{direction === 'AD_TO_BS' ? 'AD → BS' : 'BS → AD'}</span>
          </button>

          <button
            onClick={() => setShowSettings((prev) => !prev)}
            className={`p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 transition ${
              showSettings
                ? 'bg-[#0B4D3A] text-white'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
            }`}
            title="Formatting & parsing options"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Options & Settings Drawer */}
      {showSettings && (
        <div className="mb-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 space-y-3 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date Order Setting */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {isNe ? 'संख्यात्मक मिति क्रम' : 'Numeric Date Interpretation'}
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-stone-200/60 dark:bg-stone-900/60 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDateOrder('DMY')}
                  className={`py-1 text-xs font-bold rounded-lg transition ${
                    dateOrder === 'DMY'
                      ? 'bg-white dark:bg-stone-800 text-[#0B4D3A] dark:text-emerald-300 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Day first (DD/MM)
                </button>
                <button
                  type="button"
                  onClick={() => setDateOrder('MDY')}
                  className={`py-1 text-xs font-bold rounded-lg transition ${
                    dateOrder === 'MDY'
                      ? 'bg-white dark:bg-stone-800 text-[#0B4D3A] dark:text-emerald-300 shadow-2xs'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  Month first (MM/DD)
                </button>
              </div>
            </div>

            {/* Output Format Setting */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                {isNe ? 'नतिजा ढाँचा' : 'Output Date Format'}
              </label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as OutputFormat)}
                className="w-full text-xs font-bold py-1.5 px-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              >
                <option value="DD_Month_YYYY">
                  1. DD Month YYYY (Safe text: e.g. 22 Kartik 2083)
                </option>
                <option value="DD/MM/YYYY">2. DD/MM/YYYY (e.g. 22/07/2083)</option>
                <option value="YYYY-MM-DD">3. YYYY-MM-DD (e.g. 2083-07-22)</option>
                <option value="YYYY/MM/DD">4. YYYY/MM/DD (e.g. 2083/07/22)</option>
                <option value="With_Weekday">5. With Weekday (e.g. Sun, 22 Kartik 2083)</option>
              </select>
            </div>
          </div>

          {/* Nepali Digits & Month Names Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-stone-200/80 dark:border-stone-700/80">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useNepaliDigits}
                onChange={(e) => setUseNepaliDigits(e.target.checked)}
                className="w-4 h-4 rounded text-[#0B4D3A] focus:ring-[#0B4D3A] accent-[#0B4D3A]"
              />
              <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                {isNe
                  ? 'देवनागरी अङ्क र नेपाली महिना नाम प्रयोग गर्नुहोस् (०१२३४...)'
                  : 'Nepali Devanagari digits & month names (२२ कार्तिक २०८३)'}
              </span>
            </label>

            <button
              onClick={handleLoadSample}
              className="text-[11px] font-bold text-[#0B4D3A] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>{isNe ? 'परीक्षण डेटा लोड गर्नुहोस्' : 'Load sample data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Numeric Format Excel Advisory */}
      {isNumericFormat && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <p>
            <strong>Excel Advisory:</strong> Excel may treat numeric BS dates like{' '}
            <code>22/07/2083</code> as English dates. Set the destination column to{' '}
            <strong>Text</strong> before pasting back into Excel.
          </p>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePaste}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 active:scale-95 transition"
            title="Paste from clipboard"
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-[#0B4D3A] dark:text-emerald-400" />
            <span>{isNe ? 'पेस्ट गर्नुहोस्' : 'Paste from clipboard'}</span>
          </button>

          {inputText && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 transition"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isNe ? 'खाली' : 'Clear'}</span>
            </button>
          )}
        </div>

        {/* Copy Results Button */}
        <button
          onClick={handleCopy}
          disabled={!convertedText.trim()}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0B4D3A] text-white text-xs font-bold hover:bg-[#08382A] active:scale-95 transition disabled:opacity-40 shadow-xs cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-200" />
              <span>{isNe ? 'नतिजा कपि भयो!' : 'Copied!'}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{isNe ? 'नतिजा कपि गर्नुहोस्' : 'Copy results'}</span>
            </>
          )}
        </button>
      </div>

      {/* Dual Column Layout (Mobile stacked, Desktop side-by-side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Left: Input Textarea */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1 px-1">
            <span>{isNe ? 'यहाँ मिति पेस्ट गर्नुहोस् (Excel बाट):' : 'Paste dates here (from Excel):'}</span>
            <span>{direction === 'AD_TO_BS' ? 'Input: AD' : 'Input: BS'}</span>
          </div>
          <textarea
            id="bulk-input-area"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              direction === 'AD_TO_BS'
                ? `08/11/2026\n2026-04-14\n17 Oct 2026\n\n31/02/2026\n46334`
                : `22/07/2083\n2083-01-01\n31 Ashwin 2083\n\n32/02/2083`
            }
            rows={10}
            className="w-full text-xs font-mono p-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800/40 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#0B4D3A] resize-y"
          />
        </div>

        {/* Right: Output Converted Display */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1 px-1">
            <span>{isNe ? 'रूपान्तरित मितिहरू (Excel मा पेस्ट गर्न योग्य):' : 'Converted dates (Ready for Excel):'}</span>
            <span>{direction === 'AD_TO_BS' ? 'Output: BS' : 'Output: AD'}</span>
          </div>

          <div className="relative w-full h-[210px] md:h-auto min-h-[210px] overflow-y-auto text-xs font-mono p-3 rounded-2xl border border-stone-300 dark:border-stone-700 bg-emerald-50/20 dark:bg-emerald-950/10">
            {rows.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 py-10">
                <FileSpreadsheet className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">
                  {isNe
                    ? 'कुनै मिति प्रविष्ट गरिएको छैन। बाँयामा पेस्ट गर्नुहोस्।'
                    : 'No dates entered yet. Paste or type on the left.'}
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {rows.map((row, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between py-0.5 px-1.5 rounded ${
                      row.status === 'invalid'
                        ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold'
                        : row.status === 'blank'
                        ? 'h-4'
                        : 'text-stone-900 dark:text-stone-100'
                    }`}
                  >
                    <span className="truncate pr-2">
                      {row.converted || (row.status === 'blank' ? '\u00A0' : '')}
                    </span>
                    <span className="text-[9px] text-stone-400 font-sans shrink-0">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Footer Bar */}
      {rows.length > 0 && (
        <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between flex-wrap text-xs font-semibold">
          <div className="flex items-center gap-3">
            <span className="text-emerald-700 dark:text-emerald-400">
              ✓ {stats.converted} {isNe ? 'रूपान्तरित' : 'converted'}
            </span>
            {stats.invalid > 0 && (
              <span className="text-red-600 dark:text-red-400">
                ⚠ {stats.invalid} {isNe ? 'अमान्य (INVALID)' : 'invalid'}
              </span>
            )}
            {stats.blank > 0 && (
              <span className="text-stone-400">
                • {stats.blank} {isNe ? 'खाली पङ्क्ति' : 'blank'}
              </span>
            )}
          </div>

          <span className="text-stone-500 text-[11px]">
            {isNe
              ? `कुल ${stats.total} पङ्क्तिहरू (क्रम अक्षुण्ण राखिएको छ)`
              : `Total ${stats.total} rows (order & count strictly preserved)`}
          </span>
        </div>
      )}
    </div>
  );
};
