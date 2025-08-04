import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useThrottledCallback } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    
    expect(result.current).toBe('initial');
  });

  it('debounces value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated' });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Now value should be updated
    expect(result.current).toBe('updated');
  });

  it('cancels previous timeout on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: 'initial' } }
    );

    // Make multiple rapid changes
    rerender({ value: 'update1' });
    act(() => vi.advanceTimersByTime(200));
    
    rerender({ value: 'update2' });
    act(() => vi.advanceTimersByTime(200));
    
    rerender({ value: 'update3' });
    
    // Still should be initial value
    expect(result.current).toBe('initial');

    // Complete the debounce period
    act(() => vi.advanceTimersByTime(500));

    // Should have the last value
    expect(result.current).toBe('update3');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('debounces callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    // Call the debounced function multiple times
    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Callback should be called once with the last arguments
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });

  it('cancels timeout on unmount', () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current('test');
    });

    // Unmount before timeout completes
    unmount();

    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Callback should not be called
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('useThrottledCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('throttles callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 500));

    // First call should execute immediately
    act(() => {
      result.current('first');
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('first');

    // Subsequent calls within throttle period should be ignored
    act(() => {
      result.current('second');
      result.current('third');
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // After throttle period, next call should execute
    act(() => {
      vi.advanceTimersByTime(500);
      result.current('fourth');
    });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('fourth');
  });

  it('executes trailing call', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottledCallback(callback, 500));

    // First call executes immediately
    act(() => {
      result.current('first');
    });

    // Call within throttle period
    act(() => {
      vi.advanceTimersByTime(200);
      result.current('second');
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Wait for trailing call
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Trailing call should execute
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenLastCalledWith('second');
  });
});