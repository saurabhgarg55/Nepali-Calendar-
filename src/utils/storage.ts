/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Safe LocalStorage wrapper to prevent SecurityError/DOMException crashes
 * in iframe sandboxes, incognito mode, or restricted webviews (e.g. Replit).
 */

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage access blocked or restricted
    }
    return null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Storage access blocked or restricted
    }
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Storage access blocked or restricted
    }
  },
};
