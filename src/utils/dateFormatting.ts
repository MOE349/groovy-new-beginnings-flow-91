/**
 * Date Formatting Utilities
 * Provides consistent date formatting across the application
 */

/**
 * Format a Date object to YYYY-MM-DD string format for API submissions
 * @param date - Date object to format
 * @returns Formatted date string in YYYY-MM-DD format
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Automatically format all Date objects in form data to YYYY-MM-DD format
 * This is useful for components that don't use ApiForm's built-in transformation
 * @param data - Form data object that may contain Date objects
 * @returns Formatted data with all Date objects converted to YYYY-MM-DD strings
 */
export function formatFormDatesForAPI<T extends Record<string, any>>(
  data: T
): T {
  const formattedData = { ...data };

  Object.keys(formattedData).forEach((key) => {
    if (formattedData[key] instanceof Date) {
      formattedData[key] = formatDateForAPI(formattedData[key]);
    }
  });

  return formattedData;
}

/**
 * Parse a date string (YYYY-MM-DD) or Date object to a proper Date object
 * Handles various date input formats consistently
 * @param dateInput - Date string, Date object, or null/undefined
 * @returns Date object or null if input is invalid
 */
export function parseDateInput(
  dateInput: string | Date | null | undefined
): Date | null {
  if (!dateInput) return null;

  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }

  if (typeof dateInput === "string") {
    const date = new Date(dateInput);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
}

/**
 * Check if a date string is in the correct YYYY-MM-DD format
 * @param dateString - Date string to validate
 * @returns True if the date string is in YYYY-MM-DD format
 */
export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString === formatDateForAPI(date);
}
