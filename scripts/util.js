import slug from 'slug';

export function toSlug(str) {
  return slug(str.toLowerCase());
}

/**
 * Format a number for display with locale-specific formatting
 * @param {number | undefined} num - The number to format
 * @returns {string} Formatted number string or 'N/A' if not a number
 */
export function formatNumber(num) {
  if (typeof num !== 'number') return 'N/A';
  return num.toLocaleString('en-US');
}
