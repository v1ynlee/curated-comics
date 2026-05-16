// ============================================================
// General Utilities
// ============================================================

/**
 * Estimates reading hours from chapter count.
 * Average manhwa chapter: ~4 minutes.
 */
export function estimateReadingHours(chapters: number): number {
  return Math.round((chapters * 4) / 60 * 10) / 10;
}

/**
 * Formats a number with a decimal if it's not a whole number.
 * e.g. 8.5 → "8.5", 9.0 → "9"
 */
export function formatRating(rating: number): string {
  return rating % 1 === 0 ? rating.toString() : rating.toFixed(1);
}

/**
 * Converts a title string to a URL-safe slug.
 */
export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncates text to a max length, appending ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Formats a date string to a human-readable format.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Clamps a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Maps a value from one range to another.
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}
