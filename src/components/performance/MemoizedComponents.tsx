/**
 * Performance Optimized Components
 * Memoized versions of key components for better performance
 */

import React from "react";
import { ApiTable } from "@/components/ApiTable";
import { ApiForm } from "@/components/ApiForm";
import { LoadingSpinner } from "@/components/common";

// Memoized table for large datasets
export const MemoizedApiTable = React.memo(ApiTable);
MemoizedApiTable.displayName = "MemoizedApiTable";

// Memoized form for complex forms
export const MemoizedApiForm = React.memo(ApiForm);
MemoizedApiForm.displayName = "MemoizedApiForm";

// Memoized loading spinner
export const MemoizedLoadingSpinner = React.memo(LoadingSpinner);
MemoizedLoadingSpinner.displayName = "MemoizedLoadingSpinner";

// Dashboard optimizations
export const DashboardRefreshInterval = 300000; // 5 minutes instead of 30 seconds

// Virtual scrolling configuration
export const VirtualScrollConfig = {
  enabled: true,
  rowHeight: 48,
  overscan: 5,
  threshold: 100, // Enable virtual scrolling for lists > 100 items
};

// Performance utilities
export const performanceUtils = {
  // Debounce function for search/filter inputs
  debounce: <T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for scroll events
  throttle: <T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Memoize expensive calculations
  memoize: <T extends (...args: any[]) => any>(fn: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>): ReturnType<T> => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = fn(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
};