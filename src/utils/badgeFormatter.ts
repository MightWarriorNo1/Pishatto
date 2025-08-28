/**
 * Utility functions for formatting and displaying badges
 */

/**
 * Format badge count for display
 * @param count - The count to format
 * @returns Formatted count string, or '99+' for counts over 99
 */
export const formatBadgeCount = (count: number | null | undefined): string => {
  if (count === null || count === undefined || count === 0) return '0';
  
  if (count > 99) return '99+';
  
  return count.toString();
};

/**
 * Determine whether to show a badge
 * @param count - The count to check
 * @returns True if the badge should be shown, false otherwise
 */
export const shouldShowBadge = (count: number | null | undefined): boolean => {
  return count !== null && count !== undefined && count > 0;
};
