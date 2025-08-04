import React, { useRef, useState, useEffect, useCallback, CSSProperties } from 'react';
import { useThrottledCallback } from '@/hooks/useDebounce';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  containerClassName?: string;
  onScroll?: (scrollTop: number) => void;
  getItemKey?: (item: T, index: number) => string | number;
}

export function VirtualList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  containerClassName = '',
  onScroll,
  getItemKey = (_, index) => index,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Calculate item heights
  const getItemOffset = useCallback(
    (index: number): number => {
      if (typeof itemHeight === 'number') {
        return index * itemHeight;
      }
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += itemHeight(i);
      }
      return offset;
    },
    [itemHeight]
  );

  const getItemHeight = useCallback(
    (index: number): number => {
      return typeof itemHeight === 'number' ? itemHeight : itemHeight(index);
    },
    [itemHeight]
  );

  // Calculate total height
  const totalHeight = getItemOffset(items.length);

  // Calculate visible range
  const getVisibleRange = useCallback(() => {
    if (typeof itemHeight === 'number') {
      const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const endIndex = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      );
      return { startIndex, endIndex };
    }

    // Variable height items
    let startIndex = 0;
    let offset = 0;
    for (let i = 0; i < items.length; i++) {
      if (offset + getItemHeight(i) > scrollTop - overscan * 50) {
        startIndex = i;
        break;
      }
      offset += getItemHeight(i);
    }

    let endIndex = startIndex;
    for (let i = startIndex; i < items.length; i++) {
      if (offset > scrollTop + containerHeight + overscan * 50) {
        endIndex = i;
        break;
      }
      offset += getItemHeight(i);
      endIndex = i;
    }

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan, getItemHeight]);

  const { startIndex, endIndex } = getVisibleRange();

  // Handle scroll
  const handleScroll = useThrottledCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, 16); // ~60fps

  // Handle resize
  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateContainerHeight();

    const resizeObserver = new ResizeObserver(updateContainerHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Render visible items
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    if (i < items.length) {
      const item = items[i];
      const key = getItemKey(item, i);
      const style: CSSProperties = {
        position: 'absolute',
        top: getItemOffset(i),
        left: 0,
        right: 0,
        height: getItemHeight(i),
      };

      visibleItems.push(
        <div key={key} style={style}>
          {renderItem(item, i)}
        </div>
      );
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-auto ${containerClassName}`}
      onScroll={handleScroll}
    >
      <div
        className={`relative ${className}`}
        style={{ height: totalHeight }}
      >
        {visibleItems}
      </div>
    </div>
  );
}

// Helper hook for dynamic item heights
export function useDynamicItemHeight<T>(
  items: T[],
  estimatedItemHeight: number = 50
) {
  const itemHeights = useRef<Map<number, number>>(new Map());
  const measuredHeights = useRef<Set<number>>(new Set());

  const getItemHeight = useCallback(
    (index: number) => {
      return itemHeights.current.get(index) || estimatedItemHeight;
    },
    [estimatedItemHeight]
  );

  const measureItem = useCallback((index: number, element: HTMLElement | null) => {
    if (element && !measuredHeights.current.has(index)) {
      const height = element.getBoundingClientRect().height;
      itemHeights.current.set(index, height);
      measuredHeights.current.add(index);
    }
  }, []);

  const resetMeasurements = useCallback(() => {
    itemHeights.current.clear();
    measuredHeights.current.clear();
  }, []);

  return {
    getItemHeight,
    measureItem,
    resetMeasurements,
  };
}