/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Bikram Sambat (BS) <-> Gregorian (AD) Date Conversion Utility
 * Strictly follows day counting from Epoch using pure integer UTC math.
 */

import {
  BS_MONTH_DAYS,
  MIN_BS_YEAR,
  MAX_BS_YEAR,
  EPOCH_AD_UTC,
  MAX_AD_UTC,
  BS_MONTH_NAMES_EN,
  BS_MONTH_NAMES_NE,
  WEEKDAYS_FULL_EN,
  WEEKDAYS_FULL_NE,
  WEEKDAYS_EN,
  WEEKDAYS_NE,
  AD_MONTH_NAMES_SHORT,
  AD_MONTH_NAMES_FULL,
  toDevanagariDigits,
} from '../data/bsData';

const MS_PER_DAY = 86400000;

export interface BsDate {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to daysInMonth
  weekday: number; // 0 = Sunday, 6 = Saturday
}

export interface AdDate {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 31
  weekday: number; // 0 = Sunday, 6 = Saturday
}

export interface DateConversionResult {
  bs: BsDate;
  ad: AdDate;
  adDateStr: string; // YYYY-MM-DD
  bsDateStr: string; // YYYY-MM-DD
}

export function isValidBsDate(year: number, month: number, day: number): boolean {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) return false;
  if (month < 1 || month > 12) return false;
  const daysInMonth = BS_MONTH_DAYS[year]?.[month - 1];
  if (!daysInMonth) return false;
  if (day < 1 || day > daysInMonth) return false;
  return true;
}

export function getBsDaysInMonth(year: number, month: number): number {
  if (year < MIN_BS_YEAR || year > MAX_BS_YEAR) return 0;
  if (month < 1 || month > 12) return 0;
  return BS_MONTH_DAYS[year][month - 1] || 0;
}

export function getBsYearTotalDays(year: number): number {
  if (!BS_MONTH_DAYS[year]) return 0;
  return BS_MONTH_DAYS[year].reduce((acc, d) => acc + d, 0);
}

/**
 * Converts BS date (year, month, day) to AD date.
 * Throws an Error if date is out of range or invalid.
 */
export function bsToAd(year: number, month: number, day: number): DateConversionResult {
  if (!isValidBsDate(year, month, day)) {
    throw new Error(`Date out of supported range (BS 2000 to 2084) or invalid date: ${year}-${month}-${day}`);
  }

  // Count days from epoch BS 2000-01-01
  let totalDays = 0;
  for (let y = MIN_BS_YEAR; y < year; y++) {
    totalDays += getBsYearTotalDays(y);
  }

  const monthsInTargetYear = BS_MONTH_DAYS[year];
  for (let m = 1; m < month; m++) {
    totalDays += monthsInTargetYear[m - 1];
  }

  totalDays += (day - 1);

  const adUtcTime = EPOCH_AD_UTC + totalDays * MS_PER_DAY;
  const adDateObj = new Date(adUtcTime);

  const adYear = adDateObj.getUTCFullYear();
  const adMonth = adDateObj.getUTCMonth() + 1;
  const adDay = adDateObj.getUTCDate();
  const weekday = adDateObj.getUTCDay(); // 0 = Sun .. 6 = Sat

  const adDateStr = `${adYear}-${String(adMonth).padStart(2, '0')}-${String(adDay).padStart(2, '0')}`;
  const bsDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  return {
    bs: { year, month, day, weekday },
    ad: { year: adYear, month: adMonth, day: adDay, weekday },
    adDateStr,
    bsDateStr,
  };
}

/**
 * Checks if AD date is a valid Gregorian date (accounting for leap years)
 */
export function isValidAdDate(year: number, month: number, day: number): boolean {
  if (year < 1943 || year > 2030) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonths[month - 1];
}

/**
 * Converts AD date (year, month, day) to BS date.
 * Throws an Error if date is out of range or invalid.
 */
export function adToBs(year: number, month: number, day: number): DateConversionResult {
  if (!isValidAdDate(year, month, day)) {
    throw new Error(`Invalid Gregorian date: ${year}-${month}-${day}`);
  }

  const adUtcTime = Date.UTC(year, month - 1, day);
  if (adUtcTime < EPOCH_AD_UTC || adUtcTime > MAX_AD_UTC) {
    throw new Error(`Date out of supported range (BS 2000 to 2084 / 1943-04-14 to 2028-04-12 AD)`);
  }

  let diffDays = Math.round((adUtcTime - EPOCH_AD_UTC) / MS_PER_DAY);
  let bsYear = MIN_BS_YEAR;

  while (bsYear <= MAX_BS_YEAR) {
    const yearDays = getBsYearTotalDays(bsYear);
    if (diffDays >= yearDays) {
      diffDays -= yearDays;
      bsYear++;
    } else {
      break;
    }
  }

  if (bsYear > MAX_BS_YEAR) {
    throw new Error(`Date out of supported range (BS 2000 to 2084)`);
  }

  let bsMonth = 1;
  const monthDays = BS_MONTH_DAYS[bsYear];
  while (bsMonth <= 12) {
    const mDays = monthDays[bsMonth - 1];
    if (diffDays >= mDays) {
      diffDays -= mDays;
      bsMonth++;
    } else {
      break;
    }
  }

  const bsDay = diffDays + 1;
  const weekday = new Date(adUtcTime).getUTCDay();

  const adDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const bsDateStr = `${bsYear}-${String(bsMonth).padStart(2, '0')}-${String(bsDay).padStart(2, '0')}`;

  return {
    bs: { year: bsYear, month: bsMonth, day: bsDay, weekday },
    ad: { year, month, day, weekday },
    adDateStr,
    bsDateStr,
  };
}

/**
 * Formats a BS Date into specified readable layout.
 */
export type OutputFormat =
  | 'DD_Month_YYYY'
  | 'DD/MM/YYYY'
  | 'YYYY-MM-DD'
  | 'YYYY/MM/DD'
  | 'With_Weekday';

export function formatBsDate(
  bs: BsDate,
  format: OutputFormat = 'DD_Month_YYYY',
  nepaliLanguage: boolean = false
): string {
  const monthName = nepaliLanguage
    ? BS_MONTH_NAMES_NE[bs.month - 1]
    : BS_MONTH_NAMES_EN[bs.month - 1];

  const weekdayName = nepaliLanguage
    ? WEEKDAYS_FULL_NE[bs.weekday]
    : WEEKDAYS_FULL_EN[bs.weekday];

  const shortWeekday = nepaliLanguage
    ? WEEKDAYS_NE[bs.weekday]
    : WEEKDAYS_EN[bs.weekday];

  const dayStr = nepaliLanguage
    ? toDevanagariDigits(bs.day)
    : String(bs.day).padStart(2, '0');

  const monthNumStr = nepaliLanguage
    ? toDevanagariDigits(String(bs.month).padStart(2, '0'))
    : String(bs.month).padStart(2, '0');

  const yearStr = nepaliLanguage
    ? toDevanagariDigits(bs.year)
    : String(bs.year);

  switch (format) {
    case 'DD_Month_YYYY':
      return `${nepaliLanguage ? toDevanagariDigits(bs.day) : bs.day} ${monthName} ${yearStr}`;
    case 'DD/MM/YYYY':
      return `${dayStr}/${monthNumStr}/${yearStr}`;
    case 'YYYY-MM-DD':
      return `${yearStr}-${monthNumStr}-${dayStr}`;
    case 'YYYY/MM/DD':
      return `${yearStr}/${monthNumStr}/${dayStr}`;
    case 'With_Weekday':
      return `${shortWeekday}, ${nepaliLanguage ? toDevanagariDigits(bs.day) : bs.day} ${monthName} ${yearStr}`;
    default:
      return `${nepaliLanguage ? toDevanagariDigits(bs.day) : bs.day} ${monthName} ${yearStr}`;
  }
}

/**
 * Formats an AD Date into specified readable layout.
 */
export function formatAdDate(
  ad: AdDate,
  format: OutputFormat = 'DD_Month_YYYY',
  nepaliLanguage: boolean = false
): string {
  const monthName = AD_MONTH_NAMES_SHORT[ad.month - 1];
  const fullMonth = AD_MONTH_NAMES_FULL[ad.month - 1];
  const shortWeekday = nepaliLanguage ? WEEKDAYS_NE[ad.weekday] : WEEKDAYS_EN[ad.weekday];

  const dayStr = nepaliLanguage ? toDevanagariDigits(ad.day) : String(ad.day).padStart(2, '0');
  const monthNumStr = nepaliLanguage
    ? toDevanagariDigits(String(ad.month).padStart(2, '0'))
    : String(ad.month).padStart(2, '0');
  const yearStr = nepaliLanguage ? toDevanagariDigits(ad.year) : String(ad.year);

  switch (format) {
    case 'DD_Month_YYYY':
      return `${nepaliLanguage ? toDevanagariDigits(ad.day) : ad.day} ${monthName} ${yearStr}`;
    case 'DD/MM/YYYY':
      return `${dayStr}/${monthNumStr}/${yearStr}`;
    case 'YYYY-MM-DD':
      return `${yearStr}-${monthNumStr}-${dayStr}`;
    case 'YYYY/MM/DD':
      return `${yearStr}/${monthNumStr}/${dayStr}`;
    case 'With_Weekday':
      return `${shortWeekday}, ${nepaliLanguage ? toDevanagariDigits(ad.day) : ad.day} ${monthName} ${yearStr}`;
    default:
      return `${nepaliLanguage ? toDevanagariDigits(ad.day) : ad.day} ${monthName} ${yearStr}`;
  }
}

export interface SelfTestResult {
  passed: boolean;
  totalDaysVerified: number;
  failures: string[];
  testPairsCount: number;
}

/**
 * Runs the built-in self test asserting all required test pairs in both directions,
 * plus a full roundtrip conversion of all days in the supported range.
 */
export function runSelfTest(): SelfTestResult {
  const failures: string[] = [];

  const requiredPairs = [
    { bs: [2000, 1, 1], ad: [1943, 4, 14], dayOfWeek: 3 }, // Wed
    { bs: [2075, 1, 1], ad: [2018, 4, 14], dayOfWeek: 6 }, // Sat
    { bs: [2082, 1, 1], ad: [2025, 4, 14], dayOfWeek: 1 }, // Mon
    { bs: [2083, 1, 1], ad: [2026, 4, 14], dayOfWeek: 2 }, // Tue
    { bs: [2083, 6, 31], ad: [2026, 10, 17], dayOfWeek: 6 }, // Sat (Ashwin 2083 has 31 days)
    { bs: [2083, 7, 1], ad: [2026, 10, 18], dayOfWeek: 0 }, // Sun
    { bs: [2083, 7, 22], ad: [2026, 11, 8], dayOfWeek: 0 }, // Sun
    { bs: [2084, 1, 1], ad: [2027, 4, 14], dayOfWeek: 3 }, // Wed
    { bs: [2084, 12, 30], ad: [2028, 4, 12], dayOfWeek: 3 }, // Wed
  ];

  // Test required pairs
  for (const pair of requiredPairs) {
    try {
      const bsRes = bsToAd(pair.bs[0], pair.bs[1], pair.bs[2]);
      if (
        bsRes.ad.year !== pair.ad[0] ||
        bsRes.ad.month !== pair.ad[1] ||
        bsRes.ad.day !== pair.ad[2] ||
        bsRes.ad.weekday !== pair.dayOfWeek
      ) {
        failures.push(
          `BS->AD failed: ${pair.bs.join('-')} expected ${pair.ad.join('-')} w${pair.dayOfWeek}, got ${bsRes.ad.year}-${bsRes.ad.month}-${bsRes.ad.day} w${bsRes.ad.weekday}`
        );
      }
    } catch (e: any) {
      failures.push(`BS->AD threw error for ${pair.bs.join('-')}: ${e.message}`);
    }

    try {
      const adRes = adToBs(pair.ad[0], pair.ad[1], pair.ad[2]);
      if (
        adRes.bs.year !== pair.bs[0] ||
        adRes.bs.month !== pair.bs[1] ||
        adRes.bs.day !== pair.bs[2] ||
        adRes.bs.weekday !== pair.dayOfWeek
      ) {
        failures.push(
          `AD->BS failed: ${pair.ad.join('-')} expected ${pair.bs.join('-')} w${pair.dayOfWeek}, got ${adRes.bs.year}-${adRes.bs.month}-${adRes.bs.day} w${adRes.bs.weekday}`
        );
      }
    } catch (e: any) {
      failures.push(`AD->BS threw error for ${pair.ad.join('-')}: ${e.message}`);
    }
  }

  // Full round-trip test across every day in the range
  let totalDaysVerified = 0;
  for (let y = MIN_BS_YEAR; y <= MAX_BS_YEAR; y++) {
    const months = BS_MONTH_DAYS[y];
    for (let m = 1; m <= 12; m++) {
      const daysCount = months[m - 1];
      for (let d = 1; d <= daysCount; d++) {
        totalDaysVerified++;
        try {
          const adRes = bsToAd(y, m, d);
          const backToBs = adToBs(adRes.ad.year, adRes.ad.month, adRes.ad.day);
          if (
            backToBs.bs.year !== y ||
            backToBs.bs.month !== m ||
            backToBs.bs.day !== d
          ) {
            failures.push(
              `Roundtrip failed for BS ${y}-${m}-${d} -> AD ${adRes.ad.year}-${adRes.ad.month}-${adRes.ad.day} -> BS ${backToBs.bs.year}-${backToBs.bs.month}-${backToBs.bs.day}`
            );
            if (failures.length > 5) break;
          }
        } catch (e: any) {
          failures.push(`Roundtrip error at BS ${y}-${m}-${d}: ${e.message}`);
          if (failures.length > 5) break;
        }
      }
      if (failures.length > 5) break;
    }
    if (failures.length > 5) break;
  }

  const passed = failures.length === 0;
  if (passed) {
    console.log(`[Nepali Calendar] Data check: OK. Verified ${totalDaysVerified} days without any discrepancies.`);
  } else {
    console.error(`[Nepali Calendar] Data check: FAILED!`, failures);
  }

  return {
    passed,
    totalDaysVerified,
    failures,
    testPairsCount: requiredPairs.length,
  };
}
