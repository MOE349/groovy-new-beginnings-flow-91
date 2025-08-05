/**
 * Performance Optimization Hooks
 * Custom hooks for improving app performance
 */

import React, { useCallback, useRef, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

// Debounced search hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Optimized API call with caching
export function useOptimizedQuery<T = any>(
  key: string[],
  queryFn: () => Promise<T>,
  options?: {
    staleTime?: number;
    gcTime?: number;
    refetchInterval?: number;
  }
) {
  return useQuery({
    queryKey: key,
    queryFn,
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options?.gcTime || 10 * 60 * 1000, // 10 minutes
    refetchInterval: options?.refetchInterval,
    refetchOnWindowFocus: false,
    retry: 2,
  });
}

// Virtual scrolling hook
export function useVirtualScroll<T>({
  items,
  containerHeight,
  itemHeight,
  overscan = 5,
}: {
  items: T[];
  containerHeight: number;
  itemHeight: number;
  overscan?: number;
}) {
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );

    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex,
      visibleItems: items.slice(
        Math.max(0, startIndex - overscan),
        endIndex
      ),
      totalHeight: items.length * itemHeight,
      offsetY: Math.max(0, startIndex - overscan) * itemHeight,
    };
  }, [items, scrollTop, containerHeight, itemHeight, overscan]);

  const handleScroll = useCallback(() => {
    if (scrollElementRef.current) {
      setScrollTop(scrollElementRef.current.scrollTop);
    }
  }, []);

  return {
    ...visibleItems,
    scrollElementRef,
    handleScroll,
  };
}

// Memory leak prevention hook
export function useCleanup(cleanup: () => void) {
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
}

// Optimized form state management
export function useOptimizedFormState<T extends Record<string, any>>(
  initialState: T
) {
  const [state, setState] = React.useState<T>(initialState);
  const [dirtyFields, setDirtyFields] = React.useState<Set<keyof T>>(new Set());

  const setValue = useCallback((key: keyof T, value: any) => {
    setState(prev => {
      if (prev[key] !== value) {
        setDirtyFields(fields => new Set(fields).add(key));
        return { ...prev, [key]: value };
      }
      return prev;
    });
  }, []);

  const reset = useCallback((newState?: Partial<T>) => {
    setState(newState ? { ...initialState, ...newState } : initialState);
    setDirtyFields(new Set());
  }, [initialState]);

  const isDirty = dirtyFields.size > 0;

  return {
    state,
    setValue,
    reset,
    isDirty,
    dirtyFields: Array.from(dirtyFields),
  };
}