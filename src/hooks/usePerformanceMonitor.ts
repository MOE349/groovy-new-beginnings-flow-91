import { useEffect, useRef } from 'react';
import { DEV_CONFIG } from '@/config/api';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdateTime: number;
}

/**
 * Hook to monitor component performance in development
 */
export const usePerformanceMonitor = (componentName: string) => {
  const metrics = useRef<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
    lastUpdateTime: 0,
  });

  const renderStart = useRef<number>(performance.now());

  useEffect(() => {
    const mountTime = performance.now() - renderStart.current;
    metrics.current.mountTime = mountTime;

    if (DEV_CONFIG.ENABLE_DEV_TOOLS) {
      console.log(`[Performance] ${componentName} mounted in ${mountTime.toFixed(2)}ms`);
    }

    return () => {
      if (DEV_CONFIG.ENABLE_DEV_TOOLS && metrics.current.updateCount > 0) {
        console.log(`[Performance] ${componentName} stats:`, {
          mountTime: `${metrics.current.mountTime.toFixed(2)}ms`,
          updates: metrics.current.updateCount,
          avgRenderTime: `${(metrics.current.renderTime / metrics.current.updateCount).toFixed(2)}ms`,
        });
      }
    };
  }, [componentName]);

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    metrics.current.renderTime += renderTime;
    metrics.current.updateCount += 1;
    metrics.current.lastUpdateTime = renderTime;

    if (DEV_CONFIG.ENABLE_DEV_TOOLS && metrics.current.updateCount > 1) {
      console.log(`[Performance] ${componentName} re-rendered in ${renderTime.toFixed(2)}ms`);
    }

    renderStart.current = performance.now();
  });

  return metrics.current;
};

/**
 * Hook to detect unnecessary re-renders
 */
export const useWhyDidYouUpdate = (name: string, props: Record<string, any>) => {
  const previousProps = useRef<Record<string, any>>({});

  useEffect(() => {
    if (DEV_CONFIG.ENABLE_DEV_TOOLS && previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: Record<string, any> = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log('[Why did you update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
};

/**
 * Hook to measure async operation performance
 */
export const useAsyncPerformance = () => {
  const timers = useRef<Map<string, number>>(new Map());

  const startTimer = (label: string) => {
    timers.current.set(label, performance.now());
  };

  const endTimer = (label: string) => {
    const startTime = timers.current.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      timers.current.delete(label);
      
      if (DEV_CONFIG.ENABLE_DEV_TOOLS) {
        console.log(`[Async Performance] ${label}: ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    return 0;
  };

  return { startTimer, endTimer };
};