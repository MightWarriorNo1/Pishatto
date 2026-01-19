/**
 * Utility functions for consistent formatting across the application
 */

/**
 * Format a number with thousand separators
 * @param value - The number to format
 * @param locale - The locale to use for formatting (defaults to 'ja-JP')
 * @returns Formatted string with thousand separators
 */
export const formatNumber = (value: number | string | null | undefined, locale: string = 'ja-JP'): string => {
  if (value === null || value === undefined) return '0';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '0';
  
  return numValue.toLocaleString(locale);
};

/**
 * Format points with thousand separators and 'P' suffix
 * @param value - The points value to format
 * @param locale - The locale to use for formatting (defaults to 'ja-JP')
 * @returns Formatted points string
 */
export const formatPoints = (value: number | string | null | undefined, locale: string = 'ja-JP'): string => {
  return `${formatNumber(value, locale)}P`;
};

/**
 * Format fan points (fpt) for cast-side displays
 * @param value - The fpt value to format
 * @param locale - The locale to use for formatting (defaults to 'ja-JP')
 * @returns Formatted fan points string with 'fpt' suffix
 */
export const formatFanPoints = (value: number | string | null | undefined, locale: string = 'ja-JP'): string => {
  return `${formatNumber(value, locale)} fpt`;
};

/**
 * Format currency (Japanese Yen) with thousand separators and '円' suffix
 * @param value - The amount to format
 * @param locale - The locale to use for formatting (defaults to 'ja-JP')
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number | string | null | undefined, locale: string = 'ja-JP'): string => {
  return `${formatNumber(value, locale)}円`;
};

/**
 * Format currency with Yen symbol (¥) prefix
 * @param value - The amount to format
 * @param locale - The locale to use for formatting (defaults to 'ja-JP')
 * @returns Formatted currency string with ¥ symbol
 */
export const formatCurrencyWithSymbol = (value: number | string | null | undefined, locale: string = 'ja-JP'): string => {
  return `¥${formatNumber(value, locale)}`;
};

/**
 * Format duration without trailing zeros
 * Removes unnecessary decimal places for whole numbers while preserving decimals for fractional hours
 * @param duration - The duration value (in hours) as number or string (with or without "時間")
 * @returns Formatted duration string (e.g., "2時間", "2.5時間")
 * @example
 * formatDuration(2) => "2時間"
 * formatDuration(2.0) => "2時間"
 * formatDuration(2.5) => "2.5時間"
 * formatDuration("2.0") => "2時間"
 * formatDuration("2.0時間") => "2時間"
 * formatDuration("2時間") => "2時間"
 */
export const formatDuration = (duration: number | string): string => {
  // If it's a string that already contains "時間", extract the number part
  let numValue: number;
  if (typeof duration === 'string' && duration.includes('時間')) {
    numValue = parseFloat(duration.replace('時間', ''));
  } else {
    numValue = typeof duration === 'string' ? parseFloat(duration) : duration;
  }
  
  if (isNaN(numValue)) return '0時間';
  // Remove trailing zeros: 2.0 becomes 2, but 2.5 stays 2.5
  return `${numValue % 1 === 0 ? Math.floor(numValue) : numValue}時間`;
};
