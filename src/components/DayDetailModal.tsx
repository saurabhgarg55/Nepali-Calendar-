/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, Calendar, Sparkles, Check, Bookmark } from 'lucide-react';
import {
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NE,
  WEEKDAYS_FULL_EN,
  WEEKDAYS_FULL_NE,
  AD_MONTH_NAMES_FULL,
  toDevanagariDigits,
} from '../data/bsData';
import { bsToAd, formatBsDate, formatAdDate } from '../utils/dateConverter';
import {
  HolidayItem,
  getCustomNotes,
  saveCustomNote,
  deleteCustomNote,
  CustomNoteItem,
} from '../data/holidays';

interface DayDetailModalProps {
  year: number;
  month: number;
  day: number;
  language: 'en' | 'ne';
  onClose: () => void;
  onRefreshHolidays: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  year,
  month,
  day,
  language,
  onClose,
  onRefreshHolidays,
}) => {
  const isNe = language === 'ne';
  const [showAddForm, setShowAddForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [isHolidayFlag, setIsHolidayFlag] = useState(true);

  // Compute exact AD conversion
  const conversion = React.useMemo(() => {
    try {
      return bsToAd(year, month, day);
    } catch {
      return null;
    }
  }, [year, month, day]);

  // Load custom notes on this day
  const customNotesOnDay = React.useMemo(() => {
    return getCustomNotes().filter(
      (n) => n.bsYear === year && n.bsMonth === month && n.bsDay === day
    );
  }, [year, month, day, showAddForm]);

  if (!conversion) return null;

  const bsMonthName = isNe
    ? BS_MONTH_NAMES_NE[month - 1]
    : BS_MONTH_NAMES_EN[month - 1];
  const weekdayName = isNe
    ? WEEKDAYS_FULL_NE[conversion.bs.weekday]
    : WEEKDAYS_FULL_EN[conversion.bs.weekday];
  const adMonthName = AD_MONTH_NAMES_FULL[conversion.ad.month - 1];

  const bsDayStr = isNe ? toDevanagariDigits(day) : day;
  const bsYearStr = isNe ? toDevanagariDigits(year) : year;
  const adDayStr = isNe ? toDevanagariDigits(conversion.ad.day) : conversion.ad.day;
  const adYearStr = isNe ? toDevanagariDigits(conversion.ad.year) : conversion.ad.year;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    saveCustomNote({
      bsYear: year,
      bsMonth: month,
      bsDay: day,
      title: noteTitle.trim(),
      isHoliday: isHolidayFlag,
    });

    setNoteTitle('');
    setShowAddForm(false);
    onRefreshHolidays();
  };

  const handleDeleteNote = (id: string) => {
    deleteCustomNote(id);
    onRefreshHolidays();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-white dark:bg-stone-900 border-t sm:border border-stone-200 dark:border-stone-800 shadow-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:fade-in sm:zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0B4D3A] flex flex-col items-center justify-center text-white shadow-xs">
              <span className="text-xl font-black leading-none">{bsDayStr}</span>
              <span className="text-[10px] font-semibold text-emerald-200 mt-0.5">
                {bsMonthName}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 leading-tight">
                {bsDayStr} {bsMonthName} {bsYearStr}
              </h2>
              <p className="text-xs font-semibold text-[#0B4D3A] dark:text-emerald-400">
                {weekdayName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date Details Box */}
        <div className="my-4 p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              {isNe ? 'अंग्रेजी मिति (AD)' : 'Gregorian (AD) Date'}
            </span>
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {adDayStr} {adMonthName} {adYearStr} ({weekdayName})
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-[#0B4D3A]/10 text-[#0B4D3A] dark:bg-emerald-900/40 dark:text-emerald-300">
            {conversion.adDateStr}
          </span>
        </div>

        {/* Custom Personal Notes & Holidays Section */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 dark:text-stone-200">
              <Bookmark className="w-3.5 h-3.5 text-[#0B4D3A] dark:text-emerald-400" />
              <span>{isNe ? 'व्यक्तिगत नोट तथा बिदा' : 'My Holidays & Notes'}</span>
            </div>

            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-[#0B4D3A] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isNe ? 'थप्नुहोस्' : 'Add Note / Holiday'}</span>
              </button>
            )}
          </div>

          {/* Add form */}
          {showAddForm && (
            <form
              onSubmit={handleAddNote}
              className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 mb-3 space-y-3"
            >
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  {isNe ? 'शीर्षक / पर्वको नाम' : 'Title / Holiday Name'}
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder={isNe ? 'जस्तै: इद, जन्मदिन, वार्षिकोत्सव' : 'e.g. Eid, Birthday, Meeting'}
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0B4D3A]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHolidayFlag}
                  onChange={(e) => setIsHolidayFlag(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0B4D3A] focus:ring-[#0B4D3A] accent-[#0B4D3A]"
                />
                <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  {isNe
                    ? 'बिदाको रूपमा चिन्ह लगाउनुहोस् (रातो रङ)'
                    : 'Mark as holiday (red on calendar)'}
                </span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800"
                >
                  {isNe ? 'रद्द' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!noteTitle.trim()}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#0B4D3A] text-white hover:bg-[#08382A] disabled:opacity-40"
                >
                  {isNe ? 'सुरक्षित गर्नुहोस्' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* List of custom notes */}
          {customNotesOnDay.length > 0 ? (
            <div className="space-y-2">
              {customNotesOnDay.map((note) => (
                <div
                  key={note.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        note.isHoliday ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                    />
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      {note.title}
                    </span>
                    {note.isHoliday && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                        {isNe ? 'बिदा' : 'Holiday'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 rounded-md text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            !showAddForm && (
              <p className="text-xs text-stone-400 dark:text-stone-500 italic">
                {isNe
                  ? 'यस दिन कुनै व्यक्तिगत नोट सुरक्षित छैन।'
                  : 'No custom notes for this date.'}
              </p>
            )
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition"
          >
            {isNe ? 'बन्द गर्नुहोस्' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
