/**
 * Optimized Date Formatting Utilities
 * Provides memoized date formatting functions for better performance in tables
 */

// Cache for memoized date formatting results
const dateCache = new Map<string, string>();

/**
 * Optimized date formatter with memoization
 * Uses Intl.DateTimeFormat for better performance than toLocaleDateString()
 */
export const formatDateOptimized = (
  value: string | null | undefined
): string => {
  if (!value) return "-";

  // Check cache first
  if (dateCache.has(value)) {
    return dateCache.get(value)!;
  }

  try {
    // More efficient date formatting using Intl.DateTimeFormat
    const formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value + "T00:00:00"));

    // Cache the result
    dateCache.set(value, formatted);
    return formatted;
  } catch {
    return "-";
  }
};

/**
 * Optimized datetime formatter with memoization
 */
export const formatDateTimeOptimized = (
  value: string | null | undefined
): string => {
  if (!value) return "-";

  const cacheKey = `datetime_${value}`;
  if (dateCache.has(cacheKey)) {
    return dateCache.get(cacheKey)!;
  }

  try {
    const formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));

    dateCache.set(cacheKey, formatted);
    return formatted;
  } catch {
    return "-";
  }
};

/**
 * Clear the date formatting cache (useful for memory management)
 */
export const clearDateCache = (): void => {
  dateCache.clear();
};

/**
 * Get cache statistics for monitoring
 */
export const getDateCacheStats = () => ({
  size: dateCache.size,
  entries: Array.from(dateCache.entries()),
});
