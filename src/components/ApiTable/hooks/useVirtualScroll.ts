/**
 * useVirtualScroll Hook
 * Handles virtual scrolling for large datasets
 */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";

interface UseVirtualScrollProps<T> {
  items: T[];
  containerHeight: number;
  rowHeight: number | ((item: T, index: number) => number);
  overscan?: number;
  enabled?: boolean;
}

interface UseVirtualScrollReturn<T> {
  virtualItems: T[];
  totalHeight: number;
  offsetY: number;
  handleScroll: (event: React.UIEvent<HTMLElement>) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  startIndex: number;
  endIndex: number;
}

export function useVirtualScroll<T = any>({
  items,
  containerHeight,
  rowHeight,
  overscan = 3,
  enabled = true,
}: UseVirtualScrollProps<T>): UseVirtualScrollReturn<T> {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate row heights
  const getItemHeight = useCallback(
    (item: T, index: number): number => {
      if (typeof rowHeight === "function") {
        return rowHeight(item, index);
      }
      return rowHeight;
    },
    [rowHeight]
  );

  // Calculate cumulative heights for variable row heights
  const rowHeights = useMemo(() => {
    if (!enabled) return [];

    const heights: Array<{ height: number; offset: number }> = [];
    let cumulativeHeight = 0;

    items.forEach((item, index) => {
      const height = getItemHeight(item, index);
      heights.push({
        height,
        offset: cumulativeHeight,
      });
      cumulativeHeight += height;
    });

    return heights;
  }, [items, getItemHeight, enabled]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    if (!enabled) return 0;

    if (typeof rowHeight === "number") {
      return items.length * rowHeight;
    }

    return rowHeights.reduce((sum, row) => sum + row.height, 0);
  }, [items.length, rowHeight, rowHeights, enabled]);

  // Calculate visible range
  const { startIndex, endIndex, offsetY } = useMemo(() => {
    if (!enabled || items.length === 0) {
      return { startIndex: 0, endIndex: items.length, offsetY: 0 };
    }

    let startIdx = 0;
    let endIdx = items.length;
    let offset = 0;

    if (typeof rowHeight === "number") {
      // Fixed row height - simple calculation
      startIdx = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
      endIdx = Math.min(
        items.length,
        Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
      );
      offset = startIdx * rowHeight;
    } else {
      // Variable row heights - binary search for start
      let low = 0;
      let high = items.length - 1;

      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (rowHeights[mid].offset < scrollTop) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      startIdx = Math.max(0, high - overscan);
      offset = startIdx > 0 ? rowHeights[startIdx].offset : 0;

      // Find end index
      let accHeight = 0;
      endIdx = startIdx;

      for (
        let i = startIdx;
        i < items.length && accHeight < containerHeight + scrollTop - offset;
        i++
      ) {
        accHeight += rowHeights[i].height;
        endIdx = i + 1;
      }

      endIdx = Math.min(items.length, endIdx + overscan);
    }

    return { startIndex: startIdx, endIndex: endIdx, offsetY: offset };
  }, [
    scrollTop,
    containerHeight,
    rowHeight,
    overscan,
    items.length,
    rowHeights,
    enabled,
  ]);

  // Get virtual items
  const virtualItems = useMemo(() => {
    if (!enabled) return items;
    return items.slice(startIndex, endIndex);
  }, [items, startIndex, endIndex, enabled]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const target = event.currentTarget;
    setScrollTop(target.scrollTop);
  }, []);

  // Reset scroll position when items change significantly
  useEffect(() => {
    if (scrollContainerRef.current && items.length > 0) {
      const currentScrollTop = scrollContainerRef.current.scrollTop;
      const maxScrollTop = totalHeight - containerHeight;

      if (currentScrollTop > maxScrollTop) {
        scrollContainerRef.current.scrollTop = maxScrollTop;
        setScrollTop(maxScrollTop);
      }
    }
  }, [items.length, totalHeight, containerHeight]);

  return {
    virtualItems,
    totalHeight,
    offsetY,
    handleScroll,
    scrollContainerRef,
    startIndex,
    endIndex,
  };
}
