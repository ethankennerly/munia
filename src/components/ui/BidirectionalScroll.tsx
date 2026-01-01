'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { UseInfiniteQueryResult, InfiniteData } from '@tanstack/react-query';
import { GenericLoading } from '@/components/GenericLoading';
import { SomethingWentWrong } from '@/components/SometingWentWrong';
import { AllCaughtUp } from '@/components/AllCaughtUp';
import { logger } from '@/lib/logging-client';
import { NO_PREV_DATA_LOADED } from '@/constants';

interface BidirectionalScrollProps<TItem = unknown> {
  // useInfiniteQuery returns InfiniteData<TItem[]>, but we handle it internally
  queryResult: UseInfiniteQueryResult<TItem[], Error> | UseInfiniteQueryResult<InfiniteData<TItem[]>, Error>;
  renderItem: (item: TItem, index: number) => React.ReactNode;
  estimateSize?: number;
  itemSpacing?: number;
  containerSpacing?: number;
  className?: string;
}

const PREFETCH_THRESHOLD = 5;
const OVERSCAN = 10;
const DEFAULT_ESTIMATE_SIZE = 400;
const DEFAULT_ITEM_SPACING = 16;
const DEFAULT_CONTAINER_SPACING = 16;

export default function BidirectionalScroll<TItem = unknown>({
  queryResult,
  renderItem,
  estimateSize = DEFAULT_ESTIMATE_SIZE,
  itemSpacing = DEFAULT_ITEM_SPACING,
  containerSpacing = DEFAULT_CONTAINER_SPACING,
  className = '',
}: BidirectionalScrollProps<TItem>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into a single array
  const allItems = useMemo(() => {
    const data = queryResult.data as InfiniteData<TItem[]> | undefined;
    if (!data?.pages) return [];
    return data.pages.flat();
  }, [queryResult.data]);

  // Virtualizer configuration - use parentRef container (no overflow-auto, uses page scroll)
  // The container tracks scroll position but doesn't create its own scrollbar
  // Use dynamic measurement for variable item heights
  const virtualizer = useVirtualizer({
    count: allItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize + itemSpacing,
    overscan: OVERSCAN,
    // Enable dynamic height measurement for variable item heights
    measureElement: (element) => element?.getBoundingClientRect().height ?? estimateSize + itemSpacing,
  });

  // Sync container scroll with window scroll for page-level scrolling
  useEffect(() => {
    if (typeof window === 'undefined' || !parentRef.current) {
      return undefined;
    }

    const handleScroll = () => {
      if (parentRef.current) {
        // Sync container scrollTop with window scrollY for virtualization
        parentRef.current.scrollTop = window.scrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initialize scroll position
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  const innerContainerStyle = useMemo(
    () => ({
      height: `${totalSize}px`,
      width: '100%',
      position: 'relative' as const,
    }),
    [totalSize],
  );

  // Container style with consistent top spacing to match item spacing
  // Must be before early returns (React Hooks rules)
  const containerStyle = useMemo(
    () => ({
      paddingTop: `${containerSpacing}px`,
    }),
    [containerSpacing],
  );

  // Track last fetched indices and timestamps to prevent rapid successive fetches
  const lastFetchedRef = useRef<{
    first: number | null;
    last: number | null;
    firstTimestamp: number;
    lastTimestamp: number;
  }>({
    first: null,
    last: null,
    firstTimestamp: 0,
    lastTimestamp: 0,
  });

  // Extract stable index values for dependency array
  const firstIndex = virtualItems.length > 0 ? virtualItems[0]?.index ?? -1 : -1;
  const lastIndex = virtualItems.length > 0 ? virtualItems[virtualItems.length - 1]?.index ?? -1 : -1;

  // Handle prefetching when scrolling near edges
  useEffect(() => {
    if (firstIndex === -1 || lastIndex === -1 || !queryResult.data) return;

    const totalCount = allItems.length;
    const now = Date.now();
    const MIN_FETCH_INTERVAL = 500; // Prevent fetches within 500ms of each other

    // Only fetch if indices have changed, we're near edges, and enough time has passed
    const shouldFetchNext =
      firstIndex <= PREFETCH_THRESHOLD &&
      queryResult.hasNextPage &&
      !queryResult.isFetchingNextPage &&
      lastFetchedRef.current.first !== firstIndex &&
      now - lastFetchedRef.current.firstTimestamp > MIN_FETCH_INTERVAL;

    const shouldFetchPrevious =
      lastIndex >= totalCount - PREFETCH_THRESHOLD &&
      queryResult.hasPreviousPage &&
      !queryResult.isFetchingPreviousPage &&
      lastFetchedRef.current.last !== lastIndex &&
      now - lastFetchedRef.current.lastTimestamp > MIN_FETCH_INTERVAL;

    if (shouldFetchNext) {
      lastFetchedRef.current.first = firstIndex;
      lastFetchedRef.current.firstTimestamp = now;
      logger.info(
        {
          message: 'Fetching next page (older items)',
          firstIndex,
          totalCount,
          hasNextPage: queryResult.hasNextPage,
          isFetchingNextPage: queryResult.isFetchingNextPage,
        },
        'SCROLL',
      );
      queryResult.fetchNextPage();
    }

    if (shouldFetchPrevious) {
      lastFetchedRef.current.last = lastIndex;
      lastFetchedRef.current.lastTimestamp = now;
      logger.info(
        {
          message: 'Fetching previous page (newer items)',
          lastIndex,
          totalCount,
          hasPreviousPage: queryResult.hasPreviousPage,
          isFetchingPreviousPage: queryResult.isFetchingPreviousPage,
        },
        'SCROLL',
      );
      queryResult.fetchPreviousPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    firstIndex,
    lastIndex,
    allItems.length,
    queryResult.hasNextPage,
    queryResult.hasPreviousPage,
    queryResult.isFetchingNextPage,
    queryResult.isFetchingPreviousPage,
    queryResult.fetchNextPage,
    queryResult.fetchPreviousPage,
    queryResult.data,
  ]);

  // Loading state
  if (queryResult.isPending) {
    return (
      <div className={className} style={containerStyle}>
        <GenericLoading>Loading items...</GenericLoading>
      </div>
    );
  }

  // Error state - but ignore NO_PREV_DATA_LOADED as it's not a real error
  if (queryResult.isError) {
    const errorMessage = queryResult.error instanceof Error ? queryResult.error.message : String(queryResult.error);

    // NO_PREV_DATA_LOADED means there's no more data in backward direction - not an error
    if (errorMessage === NO_PREV_DATA_LOADED) {
      // Don't show error UI, just return empty state or continue showing current items
      return (
        <div ref={parentRef} className={className} style={containerStyle}>
          <div style={innerContainerStyle}>
            {/* eslint-disable react-perf/jsx-no-new-object-as-prop */}
            {virtualItems.map((virtualRow) => {
              const item = allItems[virtualRow.index];
              if (!item) return null;

              // Style object must be created per-item for virtualization (different sizes/positions)
              // Use paddingBottom for spacing (included in measurement)
              const itemStyle: React.CSSProperties = {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
                paddingBottom: `${itemSpacing}px`,
              };

              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  style={itemStyle}>
                  {renderItem(item, virtualRow.index)}
                </div>
              );
            })}
            {/* eslint-enable react-perf/jsx-no-new-object-as-prop */}
          </div>
          {!queryResult.isFetchingNextPage &&
            !queryResult.isFetchingPreviousPage &&
            !queryResult.hasNextPage &&
            !queryResult.hasPreviousPage && (
              <div className="p-4">
                <AllCaughtUp />
              </div>
            )}
        </div>
      );
    }

    logger.error(
      {
        message: 'Error state displayed',
        errorName: queryResult.error instanceof Error ? queryResult.error.name : 'Unknown',
        errorMessage,
        errorStack: queryResult.error instanceof Error ? queryResult.error.stack : undefined,
        allItemsCount: allItems.length,
        hasNextPage: queryResult.hasNextPage,
        hasPreviousPage: queryResult.hasPreviousPage,
      },
      'SCROLL',
    );

    return (
      <div className={className} style={containerStyle}>
        <SomethingWentWrong error={queryResult.error} details={errorMessage} />
      </div>
    );
  }

  // Empty state
  if (allItems.length === 0 && !queryResult.hasNextPage && !queryResult.hasPreviousPage) {
    return (
      <div className={className} style={containerStyle}>
        <AllCaughtUp />
      </div>
    );
  }

  return (
    <div ref={parentRef} className={className} style={containerStyle}>
      <div style={innerContainerStyle}>
        {/* eslint-disable react-perf/jsx-no-new-object-as-prop */}
        {virtualItems.map((virtualRow) => {
          const item = allItems[virtualRow.index];
          if (!item) return null;

          // Style object must be created per-item for virtualization (different sizes/positions)
          // Use paddingBottom for spacing (included in measurement)
          const itemStyle: React.CSSProperties = {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
            paddingBottom: `${itemSpacing}px`,
          };

          return (
            <div key={virtualRow.key} data-index={virtualRow.index} ref={virtualizer.measureElement} style={itemStyle}>
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
        {/* eslint-enable react-perf/jsx-no-new-object-as-prop */}
      </div>
      {queryResult.isFetchingNextPage && (
        <div className="p-4 text-center">
          <GenericLoading>Loading older items...</GenericLoading>
        </div>
      )}
      {queryResult.isFetchingPreviousPage && (
        <div className="p-4 text-center">
          <GenericLoading>Loading newer items...</GenericLoading>
        </div>
      )}
      {!queryResult.isFetchingNextPage &&
        !queryResult.isFetchingPreviousPage &&
        !queryResult.hasNextPage &&
        !queryResult.hasPreviousPage && (
          <div className="p-4">
            <AllCaughtUp />
          </div>
        )}
    </div>
  );
}
