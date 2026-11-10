/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Holidays & Observances Data
 * Source: Government of Nepal holiday notice for BS 2083 (Nepal Rajpatra, Khanda 75, Sankhya 67, Bhag 5)
 */

import { bsToAd, adToBs } from '../utils/dateConverter';

export type HolidayType = 'public' | 'restricted' | 'custom';

export interface HolidayItem {
  id: string;
  month: number; // BS month (1-12)
  day: number; // BS day (1-32)
  name_en: string;
  name_ne: string;
  type: HolidayType;
  category?: string; // e.g. "Women", "Kathmandu Valley", "Kirat", "Sudurpashchim"
  isCustom?: boolean;
}

export interface CustomNoteItem {
  id: string;
  bsYear: number;
  bsMonth: number;
  bsDay: number;
  title: string;
  isHoliday: boolean; // if true, treated as public holiday (red)
  createdAt: number;
}

// Fixed BS holidays that recur every year
export const FIXED_BS_HOLIDAYS: Omit<HolidayItem, 'id'>[] = [
  { month: 1, day: 1, name_en: 'Nepali New Year', name_ne: 'नयाँ वर्ष', type: 'public' },
  { month: 2, day: 15, name_en: 'Republic Day', name_ne: 'गणतन्त्र दिवस', type: 'public' },
  { month: 6, day: 3, name_en: 'Constitution Day', name_ne: 'संविधान दिवस', type: 'public' },
  { month: 9, day: 27, name_en: 'Prithvi Jayanti / National Unity Day', name_ne: 'पृथ्वी जयन्ती / राष्ट्रिय एकता दिवस', type: 'public' },
  { month: 10, day: 1, name_en: 'Maghe Sankranti', name_ne: 'माघे सङ्क्रान्ति', type: 'public' },
  { month: 10, day: 16, name_en: "Martyrs' Day", name_ne: 'सहिद दिवस', type: 'public' },
  { month: 11, day: 7, name_en: 'National Democracy Day', name_ne: 'प्रजातन्त्र दिवस', type: 'public' },
];

// Fixed AD holidays that match by English date (e.g. May 1, Mar 8, Dec 25)
export const FIXED_AD_HOLIDAYS = [
  { adMonth: 5, adDay: 1, name_en: 'International Labour Day', name_ne: 'अन्तर्राष्ट्रिय मजदुर दिवस', type: 'public' as const },
  { adMonth: 3, adDay: 8, name_en: "International Women's Day", name_ne: 'अन्तर्राष्ट्रिय महिला दिवस', type: 'public' as const },
  { adMonth: 12, adDay: 25, name_en: 'Christmas Day', name_ne: 'क्रिसमस डे', type: 'public' as const },
];

// Official holiday catalog by BS year
export const HOLIDAYS_BY_YEAR: Record<number, HolidayItem[]> = {
  2083: [
    // 6a) Public Holidays (red)
    { id: '2083-1-1', month: 1, day: 1, name_en: 'Nepali New Year', name_ne: 'नयाँ वर्ष', type: 'public' },
    { id: '2083-1-18', month: 1, day: 18, name_en: 'Buddha Jayanti / Chandi Purnima / Kirat Ubhauli', name_ne: 'बुद्ध जयन्ती', type: 'public' },
    { id: '2083-2-15', month: 2, day: 15, name_en: 'Republic Day', name_ne: 'गणतन्त्र दिवस', type: 'public' },
    { id: '2083-5-12', month: 5, day: 12, name_en: 'Janai Purnima / Rakshabandhan', name_ne: 'जनै पूर्णिमा / रक्षाबन्धन', type: 'public' },
    { id: '2083-5-19', month: 5, day: 19, name_en: 'Krishna Janmashtami', name_ne: 'कृष्ण जन्माष्टमी', type: 'public' },
    { id: '2083-6-3', month: 6, day: 3, name_en: 'Constitution Day', name_ne: 'संविधान दिवस', type: 'public' },
    { id: '2083-6-25', month: 6, day: 25, name_en: 'Ghatasthapana', name_ne: 'घटस्थापना', type: 'public' },
    { id: '2083-6-31', month: 6, day: 31, name_en: 'Dashain Holiday Begins (Fulpati)', name_ne: 'दशैं बिदा (फूलपाती)', type: 'public' },
    { id: '2083-7-1', month: 7, day: 1, name_en: 'Dashain Holiday (Maha Ashtami)', name_ne: 'दशैं बिदा (महाअष्टमी)', type: 'public' },
    { id: '2083-7-2', month: 7, day: 2, name_en: 'Dashain Holiday (Maha Navami)', name_ne: 'दशैं बिदा (महानवमी)', type: 'public' },
    { id: '2083-7-3', month: 7, day: 3, name_en: 'Dashain Holiday (Vijaya Dashami)', name_ne: 'दशैं बिदा (विजयादशमी)', type: 'public' },
    { id: '2083-7-4', month: 7, day: 4, name_en: 'Dashain Holiday (Ekadashi)', name_ne: 'दशैं बिदा (एकादशी)', type: 'public' },
    { id: '2083-7-5', month: 7, day: 5, name_en: 'Dashain Holiday (Dwadashi)', name_ne: 'दशैं बिदा (द्वादशी)', type: 'public' },
    { id: '2083-7-6', month: 7, day: 6, name_en: 'Dashain Holiday Ends (Kojagrat Purnima)', name_ne: 'दशैं बिदा (कोजाग्रत पूर्णिमा)', type: 'public' },
    { id: '2083-7-22', month: 7, day: 22, name_en: 'Laxmi Puja / Tihar Holiday Begins', name_ne: 'लक्ष्मी पूजा (तिहार बिदा सुरु)', type: 'public' },
    { id: '2083-7-23', month: 7, day: 23, name_en: 'Govardhan Puja / Tihar Holiday', name_ne: 'गोवर्धन पूजा (तिहार बिदा)', type: 'public' },
    { id: '2083-7-24', month: 7, day: 24, name_en: 'Tihar Holiday', name_ne: 'तिहार बिदा', type: 'public' },
    { id: '2083-7-25', month: 7, day: 25, name_en: 'Bhai Tika', name_ne: 'भाइटीका', type: 'public' },
    { id: '2083-7-26', month: 7, day: 26, name_en: 'Tihar Holiday', name_ne: 'तिहार बिदा', type: 'public' },
    { id: '2083-7-29', month: 7, day: 29, name_en: 'Chhath Parva', name_ne: 'छठ पर्व', type: 'public' },
    { id: '2083-9-9', month: 9, day: 9, name_en: 'Yomari Punhi / Udhauli / Jyapu Diwas', name_ne: 'योमरी पुन्हि / उधौली', type: 'public' },
    { id: '2083-9-10', month: 9, day: 10, name_en: 'Christmas Day', name_ne: 'क्रिसमस डे', type: 'public' },
    { id: '2083-9-15', month: 9, day: 15, name_en: 'Tamu Lhosar', name_ne: 'तमू ल्होछार', type: 'public' },
    { id: '2083-9-27', month: 9, day: 27, name_en: 'Prithvi Jayanti / National Unity Day', name_ne: 'पृथ्वी जयन्ती', type: 'public' },
    { id: '2083-10-1', month: 10, day: 1, name_en: 'Maghe Sankranti', name_ne: 'माघे सङ्क्रान्ति', type: 'public' },
    { id: '2083-10-16', month: 10, day: 16, name_en: "Martyrs' Day", name_ne: 'सहिद दिवस', type: 'public' },
    { id: '2083-10-24', month: 10, day: 24, name_en: 'Sonam Lhosar', name_ne: 'सोनम ल्होछार', type: 'public' },
    { id: '2083-11-7', month: 11, day: 7, name_en: 'National Democracy Day', name_ne: 'प्रजातन्त्र दिवस', type: 'public' },
    { id: '2083-11-22', month: 11, day: 22, name_en: 'Maha Shivaratri', name_ne: 'महाशिवरात्री', type: 'public' },
    { id: '2083-11-24', month: 11, day: 24, name_en: "International Women's Day", name_ne: 'महिला दिवस', type: 'public' },
    { id: '2083-11-25', month: 11, day: 25, name_en: 'Gyalpo Lhosar', name_ne: 'ग्याल्पो ल्होसार', type: 'public' },
    { id: '2083-12-7', month: 12, day: 7, name_en: 'Fagu Purnima / Holi (Hills)', name_ne: 'फागुपूर्णिमा (पहाडी जिल्ला)', type: 'public' },

    // 6b) Restricted Holidays (orange dot)
    { id: '2083-5-13', month: 5, day: 13, name_en: 'Gai Jatra', name_ne: 'गाईजात्रा', type: 'restricted', category: 'Kathmandu Valley / Newar' },
    { id: '2083-5-19-res', month: 5, day: 19, name_en: 'Gaura Parva', name_ne: 'गौरा पर्व', type: 'restricted', category: 'Sudurpashchim' },
    { id: '2083-5-29', month: 5, day: 29, name_en: 'Haritalika Teej', name_ne: 'हरितालिका तीज', type: 'restricted', category: 'Women' },
    { id: '2083-6-9', month: 6, day: 9, name_en: 'Indra Jatra', name_ne: 'इन्द्रजात्रा', type: 'restricted', category: 'Kathmandu Valley' },
    { id: '2083-6-18', month: 6, day: 18, name_en: 'Jitiya Parva', name_ne: 'जितिया पर्व', type: 'restricted', category: 'Women who observe' },
    { id: '2083-7-25-res', month: 7, day: 25, name_en: 'Falgunanda Jayanti', name_ne: 'फाल्गुनन्द जयन्ती', type: 'restricted', category: 'Kirat' },
    { id: '2083-8-17', month: 8, day: 17, name_en: 'International Day of Persons with Disabilities', name_ne: 'अपाङ्गता दिवस', type: 'restricted', category: 'Persons with Disabilities' },
    { id: '2083-9-15-res', month: 9, day: 15, name_en: 'Dura Mhaipu Nakuma', name_ne: 'दुरा ल्होसार / नकुमा', type: 'restricted', category: 'Dura Community' },
    { id: '2083-10-28', month: 10, day: 28, name_en: 'Basanta Panchami / Saraswati Puja', name_ne: 'वसन्त पञ्चमी / सरस्वती पूजा', type: 'restricted', category: 'Educational Institutions' },
    { id: '2083-12-8', month: 12, day: 8, name_en: 'Fagu Purnima / Holi (Tarai)', name_ne: 'होली (तराई जिल्ला)', type: 'restricted', category: 'Tarai Districts' },
    { id: '2083-12-23', month: 12, day: 23, name_en: 'Ghode Jatra', name_ne: 'घोडेजात्रा', type: 'restricted', category: 'Kathmandu Valley' },
  ],
};

const STORAGE_KEY_CUSTOM_NOTES = 'nepali_calendar_custom_notes_v1';

export function getCustomNotes(): CustomNoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_NOTES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveCustomNote(note: Omit<CustomNoteItem, 'id' | 'createdAt'>): CustomNoteItem {
  const existing = getCustomNotes();
  const newNote: CustomNoteItem = {
    ...note,
    id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
  };
  const updated = [...existing, newNote];
  localStorage.setItem(STORAGE_KEY_CUSTOM_NOTES, JSON.stringify(updated));
  return newNote;
}

export function deleteCustomNote(id: string): void {
  const existing = getCustomNotes();
  const updated = existing.filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY_CUSTOM_NOTES, JSON.stringify(updated));
}

/**
 * Returns all holidays and observances for a given BS year and month,
 * including official holidays, fixed holidays, AD-fixed holidays, and user custom notes.
 */
export function getHolidaysForBsMonth(year: number, month: number): HolidayItem[] {
  const result: HolidayItem[] = [];

  // Check if official list exists for this year
  if (HOLIDAYS_BY_YEAR[year]) {
    const yearList = HOLIDAYS_BY_YEAR[year].filter((h) => h.month === month);
    result.push(...yearList);
  } else {
    // For years with no official list, show ONLY the fixed national days
    const fixedBs = FIXED_BS_HOLIDAYS.filter((h) => h.month === month).map((h) => ({
      ...h,
      id: `fixed-bs-${year}-${h.month}-${h.day}`,
    }));
    result.push(...fixedBs);

    // Map AD-fixed holidays: find which BS day corresponds to them in this BS year & month
    for (const adFix of FIXED_AD_HOLIDAYS) {
      try {
        // Approximate corresponding AD year is BS year - 57 (or -56 depending on month)
        // Check candidate AD years:
        for (const adYear of [year - 57, year - 56]) {
          try {
            const conv = adToBs(adYear, adFix.adMonth, adFix.adDay);
            if (conv.bs.year === year && conv.bs.month === month) {
              result.push({
                id: `fixed-ad-${year}-${month}-${conv.bs.day}`,
                month: conv.bs.month,
                day: conv.bs.day,
                name_en: adFix.name_en,
                name_ne: adFix.name_ne,
                type: adFix.type,
              });
            }
          } catch {
            // ignore if out of range
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // Add user custom notes/holidays for this year & month
  const customNotes = getCustomNotes().filter((n) => n.bsYear === year && n.bsMonth === month);
  for (const cn of customNotes) {
    result.push({
      id: cn.id,
      month: cn.bsMonth,
      day: cn.bsDay,
      name_en: cn.title,
      name_ne: cn.title,
      type: cn.isHoliday ? 'public' : 'custom',
      isCustom: true,
      category: cn.isHoliday ? 'Custom Holiday' : 'Personal Note',
    });
  }

  // Sort by day ascending
  result.sort((a, b) => a.day - b.day);
  return result;
}

/**
 * Returns holiday items for a specific BS date (year, month, day).
 */
export function getHolidaysForBsDay(year: number, month: number, day: number): HolidayItem[] {
  const monthHolidays = getHolidaysForBsMonth(year, month);
  return monthHolidays.filter((h) => h.day === day);
}
