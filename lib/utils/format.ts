/**
 * Formatting Utilities
 * Common formatting functions for dates, numbers, and currency
 */

import { DATE_FORMATS } from '@/lib/constants/app';

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format number as currency
 * @param amount - Amount to format
 * @param currency - Currency code (default: AED)
 * @param locale - Locale for formatting (default: en-AE)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string = 'AED',
  locale: string = 'en-AE'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number as compact currency (e.g., 1.5K, 2.3M)
 * @param amount - Amount to format
 * @param currency - Currency code (default: AED)
 * @param locale - Locale for formatting (default: en-AE)
 * @returns Formatted compact currency string
 */
export function formatCompactCurrency(
  amount: number,
  currency: string = 'AED',
  locale: string = 'en-AE'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);
}

// ============================================================================
// NUMBER FORMATTING
// ============================================================================

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format number as percentage
 * @param value - Value to format (0-1 or 0-100)
 * @param asDecimal - Whether value is decimal (0-1) or percentage (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: number,
  asDecimal: boolean = true
): string {
  const percentage = asDecimal ? value * 100 : value;
  return `${percentage.toFixed(2)}%`;
}

/**
 * Format file size in bytes to human readable format
 * @param bytes - Size in bytes
 * @returns Formatted size string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date to display format (DD/MM/YYYY)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '-';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format date to API format (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateForAPI(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

/**
 * Format date with time
 * @param date - Date to format
 * @returns Formatted date-time string
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '-';
  
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(d.getTime())) return '-';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(d);
}

// ============================================================================
// STRING FORMATTING
// ============================================================================

/**
 * Capitalize first letter of string
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert string to title case
 * @param str - String to convert
 * @returns Title cased string
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

/**
 * Convert string to slug (URL-friendly)
 * @param str - String to convert
 * @returns Slug string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// PHONE FORMATTING
// ============================================================================

/**
 * Format phone number for display
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // International format
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }
  
  return phone;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param value - Value to check
 * @returns True if empty
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Parse number from string, returns 0 if invalid
 * @param value - Value to parse
 * @returns Parsed number
 */
export function parseNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}