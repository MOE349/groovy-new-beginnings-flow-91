/**
 * Retry Logic Module
 * Handles retry with exponential backoff and custom retry conditions
 */

import type { ApiError, RetryConfig } from './types';

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  retries: 3,
  retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
  retryCondition: (error: ApiError) => {
    // Retry on network errors or 5xx server errors
    return !error.status || (error.status >= 500 && error.status < 600);
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: ApiError | undefined;

  for (let attempt = 0; attempt <= finalConfig.retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as ApiError;

      // Check if we should retry
      if (
        attempt === finalConfig.retries ||
        !finalConfig.retryCondition(lastError)
      ) {
        throw error;
      }

      // Calculate delay
      const delay =
        typeof finalConfig.retryDelay === 'function'
          ? finalConfig.retryDelay(attempt)
          : finalConfig.retryDelay;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function exponentialBackoff(attempt: number, baseDelay = 1000): number {
  return Math.min(baseDelay * 2 ** attempt, 30000);
}

export function linearBackoff(attempt: number, delay = 1000): number {
  return delay * (attempt + 1);
}

export function isRetryableError(error: ApiError): boolean {
  // Network errors (no status)
  if (!error.status) return true;

  // Server errors (5xx)
  if (error.status >= 500 && error.status < 600) return true;

  // Rate limiting (429)
  if (error.status === 429) return true;

  // Request timeout (408)
  if (error.status === 408) return true;

  return false;
}