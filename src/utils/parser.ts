/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Date Parser for Single & Bulk Conversion (Excel compatible)
 */

import {
  bsToAd,
  adToBs,
  formatBsDate,
  formatAdDate,
  OutputFormat,
  isValidAdDate,
  isValidBsDate,
} from './dateConverter';
import {
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NE,
  AD_MONTH_NAMES_FULL,
  AD_MONTH_NAMES_SHORT,
  toDevanagariDigits,
} from '../data/bsData';
export type { OutputFormat } from './dateConverter';
export type ConversionDirection = 'AD_TO_BS' | 'BS_TO_AD';
export type DateOrder = 'DMY' | 'MDY';

const EXCEL_BASE_MS = Date.UTC(1899, 11, 30); // Dec 30, 1899
const MS_PER_DAY = 86400000;

const AD_MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

const BS_MONTH_MAP: Record<string, number> = {
  baisakh: 1, baishakh: 1, vaisakh: 1, बैशाख: 1,
  jestha: 2, jyestha: 2, jeth: 2, जेष्ठ: 2,
  ashadh: 3, ashad: 3, asar: 3, asadh: 3, आषाढ: 3,
  shrawan: 4, shravan: 4, saun: 4, श्रावण: 4,
  bhadra: 5, bhado: 5, bhadau: 5, bhadrapad: 5, भाद्र: 5,
  ashwin: 6, asoj: 6, ashoj: 6, आश्विन: 6,
  kartik: 7, kartick: 7, katti: 7, कार्तिक: 7,
  mangsir: 8, mansir: 8, marga: 8, मंसिर: 8, मार्ग: 8,
  poush: 9, pous: 9, paush: 9, push: 9, पौष: 9,
  magh: 10, माघ: 10,
  falgun: 11, phagun: 11, फाल्गुन: 11,
  chaitra: 12, chait: 12, चैत्र: 12,
};

// Convert Devanagari digits to standard Arabic numbers
function normalizeDevanagariDigits(str: string): string {
  const devanagariMap: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  return str.replace(/[०-९]/g, (ch) => devanagariMap[ch] || ch);
}

/**
 * Strips extra whitespace, enclosing quotes, and trailing timestamps like "10:30", "12:00:00", "00:00:00.000", "T10:00:00"
 */
export function cleanRawDateString(raw: string): string {
  let s = raw.trim();
  // Strip leading/trailing double or single quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // Remove ISO 'T' timestamp: 2026-11-08T10:30:00...
  s = s.replace(/T\d{1,2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/i, '');
  // Remove trailing time like "10:30" or "00:00:00" or " 10:30 AM"
  s = s.replace(/\s+\d{1,2}:\d{2}(:\d{2})?(\s*(am|pm))?$/i, '');
  return normalizeDevanagariDigits(s.trim());
}

export interface ParsedDate {
  year: number;
  month: number;
  day: number;
}

/**
 * Parses an AD date string into year, month, day.
 * Returns null if not recognizable as a valid AD date.
 */
export function parseAdInput(raw: string, order: DateOrder = 'DMY'): ParsedDate | null {
  const s = cleanRawDateString(raw);
  if (!s) return null;

  // 1. Check Excel serial number (numeric only, e.g. 46334)
  if (/^\d{3,5}$/.test(s)) {
    const serial = parseInt(s, 10);
    // Excel serials below 61 or above 60000 are treated as INVALID
    if (serial < 61 || serial > 60000) return null;
    const utcMs = EXCEL_BASE_MS + serial * MS_PER_DAY;
    const d = new Date(utcMs);
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    };
  }

  // 2. YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = s.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (isValidAdDate(year, month, day)) {
      return { year, month, day };
    }
    return null;
  }

  // 3. Text month formats: e.g. "5 Nov 2026", "05-Nov-2026", "5 November 2026", "Nov 5, 2026", "November 5 2026"
  // Day Month Year
  const dmyText = s.match(/^(\d{1,2})[-/., ]+([a-zA-Z]+)[-/., ]+(\d{4})$/);
  if (dmyText) {
    const day = parseInt(dmyText[1], 10);
    const mStr = dmyText[2].toLowerCase();
    const month = AD_MONTH_MAP[mStr];
    const year = parseInt(dmyText[3], 10);
    if (month && isValidAdDate(year, month, day)) {
      return { year, month, day };
    }
  }

  // Month Day Year: e.g. "Nov 5 2026", "November 5, 2026"
  const mdyText = s.match(/^([a-zA-Z]+)[-/., ]+(\d{1,2})[-/., ]+(\d{4})$/);
  if (mdyText) {
    const mStr = mdyText[1].toLowerCase();
    const month = AD_MONTH_MAP[mStr];
    const day = parseInt(mdyText[2], 10);
    const year = parseInt(mdyText[3], 10);
    if (month && isValidAdDate(year, month, day)) {
      return { year, month, day };
    }
  }

  // 4. Numeric formats: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY (or MM/DD/YYYY depending on date order setting)
  const numMatch = s.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})$/);
  if (numMatch) {
    const first = parseInt(numMatch[1], 10);
    const second = parseInt(numMatch[2], 10);
    const year = parseInt(numMatch[3], 10);

    let day = order === 'DMY' ? first : second;
    let month = order === 'DMY' ? second : first;

    // Smart fallback if one of them is clearly > 12
    if (first > 12 && second <= 12) {
      day = first;
      month = second;
    } else if (second > 12 && first <= 12) {
      day = second;
      month = first;
    }

    if (isValidAdDate(year, month, day)) {
      return { year, month, day };
    }
    return null;
  }

  return null;
}

/**
 * Parses a BS date string into year, month, day.
 * Returns null if not recognizable or out of range.
 */
export function parseBsInput(raw: string, order: DateOrder = 'DMY'): ParsedDate | null {
  const s = cleanRawDateString(raw);
  if (!s) return null;

  // 1. YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = s.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10);
    const day = parseInt(ymdMatch[3], 10);
    if (isValidBsDate(year, month, day)) {
      return { year, month, day };
    }
    return null;
  }

  // 2. Text month formats for BS: e.g. "22 Kartik 2083", "22-Kartik-2083", "Kartik 22 2083", "२२ कार्तिक २०८३"
  const dmyText = s.match(/^(\d{1,2})[-/., ]+([a-zA-Z\u0900-\u097F]+)[-/., ]+(\d{4})$/);
  if (dmyText) {
    const day = parseInt(dmyText[1], 10);
    const mStr = dmyText[2].toLowerCase();
    const month = BS_MONTH_MAP[mStr];
    const year = parseInt(dmyText[3], 10);
    if (month && isValidBsDate(year, month, day)) {
      return { year, month, day };
    }
  }

  const mdyText = s.match(/^([a-zA-Z\u0900-\u097F]+)[-/., ]+(\d{1,2})[-/., ]+(\d{4})$/);
  if (mdyText) {
    const mStr = mdyText[1].toLowerCase();
    const month = BS_MONTH_MAP[mStr];
    const day = parseInt(mdyText[2], 10);
    const year = parseInt(mdyText[3], 10);
    if (month && isValidBsDate(year, month, day)) {
      return { year, month, day };
    }
  }

  // 3. Numeric formats: DD/MM/YYYY or MM/DD/YYYY
  const numMatch = s.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})$/);
  if (numMatch) {
    const first = parseInt(numMatch[1], 10);
    const second = parseInt(numMatch[2], 10);
    const year = parseInt(numMatch[3], 10);

    let day = order === 'DMY' ? first : second;
    let month = order === 'DMY' ? second : first;

    if (first > 12 && second <= 12) {
      day = first;
      month = second;
    } else if (second > 12 && first <= 12) {
      day = second;
      month = first;
    }

    if (isValidBsDate(year, month, day)) {
      return { year, month, day };
    }
    return null;
  }

  return null;
}

export interface BulkConversionRow {
  original: string;
  converted: string;
  status: 'blank' | 'converted' | 'invalid';
}

export interface BulkConversionStats {
  total: number;
  converted: number;
  invalid: number;
  blank: number;
}

/**
 * Converts a cell value depending on direction.
 * If cell is blank, returns blank.
 * If cell is recognized as date, converts it.
 * If cell is not a date in a multi-cell row, keeps original cell text.
 * In a single-cell row, if text exists but is not a valid date, returns "INVALID".
 */
export function convertCell(
  cellText: string,
  direction: ConversionDirection,
  order: DateOrder,
  format: OutputFormat,
  nepaliDigits: boolean,
  isSingleCellRow: boolean
): { text: string; status: 'blank' | 'converted' | 'invalid' | 'preserved' } {
  const trimmed = cellText.trim();
  if (!trimmed) {
    return { text: cellText, status: 'blank' };
  }

  if (direction === 'AD_TO_BS') {
    const parsed = parseAdInput(trimmed, order);
    if (parsed) {
      try {
        const res = adToBs(parsed.year, parsed.month, parsed.day);
        const formatted = formatBsDate(res.bs, format, nepaliDigits);
        return { text: formatted, status: 'converted' };
      } catch {
        return { text: 'INVALID', status: 'invalid' };
      }
    } else {
      // If it's a single cell line, the user intended it as a date, so flag INVALID.
      // If it's a tabular column cell with other text (e.g. "Invoice #123"), preserve it!
      if (isSingleCellRow) {
        return { text: 'INVALID', status: 'invalid' };
      } else {
        return { text: cellText, status: 'preserved' };
      }
    }
  } else {
    // BS -> AD
    const parsed = parseBsInput(trimmed, order);
    if (parsed) {
      try {
        const res = bsToAd(parsed.year, parsed.month, parsed.day);
        const formatted = formatAdDate(res.ad, format, nepaliDigits);
        return { text: formatted, status: 'converted' };
      } catch {
        return { text: 'INVALID', status: 'invalid' };
      }
    } else {
      if (isSingleCellRow) {
        return { text: 'INVALID', status: 'invalid' };
      } else {
        return { text: cellText, status: 'preserved' };
      }
    }
  }
}

/**
 * Bulk converts multi-line pasted Excel data.
 * Preserves row count, blank lines, and tabs.
 */
export function bulkConvert(
  text: string,
  direction: ConversionDirection,
  order: DateOrder = 'DMY',
  format: OutputFormat = 'DD_Month_YYYY',
  nepaliDigits: boolean = false
): { rows: BulkConversionRow[]; stats: BulkConversionStats } {
  if (!text) {
    return {
      rows: [],
      stats: { total: 0, converted: 0, invalid: 0, blank: 0 },
    };
  }

  // Normalize line endings
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const rows: BulkConversionRow[] = [];

  let convertedCount = 0;
  let invalidCount = 0;
  let blankCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) {
      rows.push({ original: line, converted: '', status: 'blank' });
      blankCount++;
      continue;
    }

    // Check for tab separation (Excel multi-column paste)
    const cells = line.split('\t');
    const isSingleCell = cells.length === 1;

    let hasConverted = false;
    let hasInvalid = false;

    const convertedCells = cells.map((cell) => {
      const res = convertCell(cell, direction, order, format, nepaliDigits, isSingleCell);
      if (res.status === 'converted') hasConverted = true;
      if (res.status === 'invalid') hasInvalid = true;
      return res.text;
    });

    const convertedLine = convertedCells.join('\t');

    let rowStatus: 'blank' | 'converted' | 'invalid' = 'converted';
    if (hasInvalid) {
      rowStatus = 'invalid';
      invalidCount++;
    } else if (hasConverted) {
      rowStatus = 'converted';
      convertedCount++;
    } else {
      // If neither converted nor marked invalid (e.g. preserved multi-column row with no date)
      rowStatus = 'converted';
    }

    rows.push({
      original: line,
      converted: convertedLine,
      status: rowStatus,
    });
  }

  return {
    rows,
    stats: {
      total: lines.length,
      converted: convertedCount,
      invalid: invalidCount,
      blank: blankCount,
    },
  };
}
