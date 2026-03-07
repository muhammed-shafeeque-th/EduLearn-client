import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
/* eslint-disable @typescript-eslint/no-explicit-any */

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown, fallbackMessage = 'Something went wrong'): string {
  return error instanceof Error
    ? error.message
    : typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
      ? error.message
      : typeof error === 'string'
        ? error
        : fallbackMessage;
}

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (Number.isNaN(a) && Number.isNaN(b)) return true;

  if (a == null || b == null) return a === b;

  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!isEqual(a[key], b[key])) return false;
    }
    return true;
  }

  if (typeof a === 'function' && typeof b === 'function') {
    return a === b;
  }

  return a === b;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// export function debounce<T extends (...args: any[]) => any>(
//   func: T,
//   wait: number
// ): (...args: Parameters<T>) => void {
//   let timeout: NodeJS.Timeout;
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export function generateChatId(user1Id: string, user2Id: string): string {
  return [user1Id, user2Id].sort().join('-');
}

export function truncateMessage(message: string, maxLength: number = 50): string {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
}

export function formatPrice(price: number, currency = 'INR', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,19}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];

  for (let i = 0; i < match.length; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  return parts.length ? parts.join(' ') : v;
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function formatExpiryDate(value: string): string {
  const v = value.replace(/\D/g, '');
  if (v.length >= 2) {
    return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
  }
  return v;
}

export function getCardType(number: string): string {
  const cleanNumber = number.replace(/\s/g, '');

  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';

  return 'unknown';
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateCardNumber(number: string): boolean {
  const cleanNumber = number.replace(/\s/g, '');
  return /^\d{13,19}$/.test(cleanNumber) && luhnCheck(cleanNumber);
}

function luhnCheck(num: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function reviveDates(key: string, value: string) {
  const isoDateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
  if (typeof value === 'string' && isoDateFormat.test(value)) {
    return new Date(value);
  }
  return value;
}

/**
 * Decodes the payload of a JWT token using best practices.
 *
 * @param token - The full JWT string (header.payload.signature)
 * @returns The decoded payload as object, or null if invalid/undecodable
 */
export function decodeJwt<T = any>(token: string): T | null {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  let payload = parts[1];

  // Convert base64url to base64
  payload = payload.replace(/-/g, '+').replace(/_/g, '/');
  const pad = 4 - (payload.length % 4);
  if (pad !== 4) {
    payload += '='.repeat(pad);
  }

  try {
    const decoded =
      typeof window !== 'undefined'
        ? window.atob(payload)
        : Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded) as T;
  } catch {
    return null;
  }
}

export const saveToLocalStorage = <T = unknown>(key: string, value: T, expInMs?: number) => {
  const item = {
    value,
    expiry: expInMs,
  };
  try {
    const strValue = JSON.stringify(item);
    localStorage.setItem(key, strValue);
  } catch (error) {
    console.error(`Error setting localStorage key "${key}":`, error);
  }
};

export const getFromLocalStorage = <T = any>(key: string): T | null => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr) as { value: T; expiry?: number };
    if (item.expiry && Date.now() > item.expiry) {
      removeFromLocalStorage(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error(`Error while getting localStorage key "${key}":`, error);
    throw error;
  }
};

export const removeFromLocalStorage = (key: string) => {
  localStorage.removeItem(key);
};

export function isUUID(str: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  return regex.test(str);
}

/**
 * Safe getter for window object, returns undefined on server.
 */
export function getWindow(): Window | undefined {
  return typeof window !== 'undefined' ? window : undefined;
}

/**
 * Safe getter for document object, returns undefined on server.
 */
export function getDocument(): Document | undefined {
  return typeof document !== 'undefined' ? document : undefined;
}

/**
 * Safe getter for navigator object, returns undefined on server.
 */
export function getNavigator(): Navigator | undefined {
  return typeof navigator !== 'undefined' ? navigator : undefined;
}

/**
 * Converts an amount in the smallest currency unit as its standard unit as a float.
 * Returns 0 for invalid, null, undefined, or zero values. Always returns result with 2 decimal precision.
 *
 * @param amountInSubunits - Amount in smallest currency unit (e.g., "1050" cents for $10.50)
 * @returns Amount in standard currency unit (e.g., 10.5)
 */
export function normalizeCurrencyAmount(
  amountInSubunits: number | string | undefined | null
): number {
  // Handle null or undefined explicitly
  if (amountInSubunits === null || amountInSubunits === undefined) return 0;

  let normalized: number;
  if (typeof amountInSubunits === 'string') {
    // Remove any commas, trim spaces
    const sanitized = amountInSubunits.replace(/,/g, '').trim();
    normalized = parseFloat(sanitized);
  } else {
    normalized = amountInSubunits;
  }

  if (
    typeof normalized !== 'number' ||
    !isFinite(normalized) ||
    isNaN(normalized) ||
    normalized === 0
  ) {
    return 0;
  }

  const standardUnit = normalized / 100;

  return Math.round(standardUnit * 100) / 100;
}
