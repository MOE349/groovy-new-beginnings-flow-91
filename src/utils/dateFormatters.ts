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
    // Check for special suffixes like "?" and preserve them
    const hasQuestionMark = value.endsWith("?");
    const cleanValue = hasQuestionMark ? value.slice(0, -1) : value;

    // Handle different date formats
    const dateInput = cleanValue.includes("T")
      ? cleanValue
      : cleanValue + "T00:00:00";
    const date = new Date(dateInput);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    // More readable date formatting
    const formatted = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(date);

    // Add back any special suffixes
    const finalResult = formatted + (hasQuestionMark ? "?" : "");

    // Cache the result
    dateCache.set(value, finalResult);
    return finalResult;
  } catch (error) {
    console.warn("Date formatting error for value:", value, error);
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
    // Check for special suffixes like "?" and preserve them
    const hasQuestionMark = value.endsWith("?");
    const cleanValue = hasQuestionMark ? value.slice(0, -1) : value;

    const date = new Date(cleanValue);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "-";
    }

    // For dates that are exactly midnight (00:00:00), show date only
    const isExactlyMidnight =
      date.getUTCHours() === 0 &&
      date.getUTCMinutes() === 0 &&
      date.getUTCSeconds() === 0;

    let formatted;
    if (isExactlyMidnight) {
      // Show just the date for midnight times (likely date-only fields)
      formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date);
    } else {
      // Show full datetime for actual times
      formatted = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "UTC",
      }).format(date);
    }

    // Add back any special suffixes
    const finalResult = formatted + (hasQuestionMark ? "?" : "");

    dateCache.set(cacheKey, finalResult);
    return finalResult;
  } catch (error) {
    console.warn("Date formatting error for value:", value, error);
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
 * Compact date formatter for narrow columns
 */
export const formatDateCompact = (value: string | null | undefined): string => {
  if (!value) return "-";

  const cacheKey = `compact_${value}`;
  if (dateCache.has(cacheKey)) {
    return dateCache.get(cacheKey)!;
  }

  try {
    // Check for special suffixes like "?" and preserve them
    const hasQuestionMark = value.endsWith("?");
    const cleanValue = hasQuestionMark ? value.slice(0, -1) : value;

    const dateInput = cleanValue.includes("T")
      ? cleanValue
      : cleanValue + "T00:00:00";

    const formatted = new Intl.DateTimeFormat("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
      timeZone: "UTC",
    }).format(new Date(dateInput));

    // Add back any special suffixes
    const finalResult = formatted + (hasQuestionMark ? "?" : "");

    dateCache.set(cacheKey, finalResult);
    return finalResult;
  } catch {
    return "-";
  }
};

/**
 * Relative time formatter (e.g., "2 days ago", "in 3 hours")
 */
export const formatRelativeTime = (
  value: string | null | undefined
): string => {
  if (!value) return "-";

  try {
    const date = new Date(value);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (Math.abs(diffDays) >= 7) {
      // For dates more than a week away, show the actual date
      return formatDateOptimized(value);
    } else if (Math.abs(diffDays) >= 1) {
      return diffDays > 0
        ? `in ${diffDays} days`
        : `${Math.abs(diffDays)} days ago`;
    } else if (Math.abs(diffHours) >= 1) {
      return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`;
    } else if (Math.abs(diffMinutes) >= 1) {
      return diffMinutes > 0
        ? `in ${diffMinutes}m`
        : `${Math.abs(diffMinutes)}m ago`;
    } else {
      return "now";
    }
  } catch {
    return "-";
  }
};

/**
 * Get cache statistics for monitoring
 */
export const getDateCacheStats = () => ({
  size: dateCache.size,
  entries: Array.from(dateCache.entries()),
});
