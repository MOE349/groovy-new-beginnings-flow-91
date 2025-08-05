/**
 * Bundle Optimization Utilities
 * Tools for analyzing and optimizing bundle size
 */

// Utility to dynamically import components only when needed
export const importComponent = <T = any>(
  importFn: () => Promise<any>,
  componentName?: string
): Promise<T> => {
  return importFn().then(module => {
    const component = module.default || module[componentName || 'default'];
    if (!component) {
      throw new Error(`Component ${componentName || 'default'} not found in module`);
    }
    return component;
  });
};

// Preload critical components
export const preloadComponent = (importFn: () => Promise<any>) => {
  return importFn();
};

// Bundle analyzer helper (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 Bundle Analysis');
    console.log('Component chunks loaded:', Object.keys(window).filter(key => 
      key.startsWith('webpackChunk')
    ).length);
    
    // Memory usage if available
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('JS Heap Size:', (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB');
      console.log('Total Heap Size:', (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB');
    }
    
    console.groupEnd();
  }
};

// Component size tracker
export const trackComponentSize = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    return {
      end: () => {
        const end = performance.now();
        console.log(`⚡ ${componentName} render time: ${(end - start).toFixed(2)}ms`);
      }
    };
  }
  return { end: () => {} };
};