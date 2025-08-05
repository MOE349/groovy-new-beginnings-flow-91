/**
 * Memory Cleanup Hook
 * Prevents memory leaks by cleaning up resources
 */

import { useEffect, useRef } from "react";

export function useMemoryCleanup() {
  const cleanupRef = useRef<(() => void)[]>([]);

  const addCleanup = (cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
  };

  const removeCleanup = (cleanup: () => void) => {
    const index = cleanupRef.current.indexOf(cleanup);
    if (index > -1) {
      cleanupRef.current.splice(index, 1);
    }
  };

  useEffect(() => {
    return () => {
      // Clean up all registered cleanup functions
      cleanupRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn('Cleanup function error:', error);
        }
      });
      cleanupRef.current = [];
    };
  }, []);

  return { addCleanup, removeCleanup };
}

// Hook for AbortController cleanup
export function useAbortController() {
  const controllerRef = useRef<AbortController | null>(null);

  const getController = () => {
    if (!controllerRef.current || controllerRef.current.signal.aborted) {
      controllerRef.current = new AbortController();
    }
    return controllerRef.current;
  };

  const abort = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      abort();
    };
  }, []);

  return { getController, abort, signal: controllerRef.current?.signal };
}

// Hook for subscription cleanup
export function useSubscriptionCleanup<T>(
  subscribe: (callback: (data: T) => void) => () => void,
  callback: (data: T) => void,
  deps: any[] = []
) {
  useEffect(() => {
    const unsubscribe = subscribe(callback);
    return unsubscribe;
  }, deps);
}