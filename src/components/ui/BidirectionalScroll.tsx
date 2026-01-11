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
  // Optional function to sort items to ensure correct order (e.g., newer posts at top)
  sortItems?: (items: TItem[]) => TItem[];
}

const PREFETCH_THRESHOLD = 5;
const OVERSCAN = 10;
const DEFAULT_ESTIMATE_SIZE = 400;
const DEFAULT_ITEM_SPACING = 16;
const DEFAULT_CONTAINER_SPACING = 16;
const DEBUG_STYLE = { fontFamily: 'monospace' };

export default function BidirectionalScroll<TItem = unknown>({
  queryResult,
  renderItem,
  estimateSize = DEFAULT_ESTIMATE_SIZE,
  itemSpacing = DEFAULT_ITEM_SPACING,
  containerSpacing = DEFAULT_CONTAINER_SPACING,
  className = '',
  sortItems,
}: BidirectionalScrollProps<TItem>) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Flatten all pages into a single array and sort if needed
  // Newer items should be at the top (index 0), older items at the bottom
  const allItems = useMemo(() => {
    const data = queryResult.data as InfiniteData<TItem[]> | undefined;
    if (!data?.pages) return [];
    const flattened = data.pages.flat();
    return sortItems ? sortItems(flattened) : flattened;
  }, [queryResult.data, sortItems]);

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

  // Log component state on mount/update for debugging (use info level so it's visible in console)
  useEffect(() => {
    logger.info(
      {
        message: 'BidirectionalScroll state update',
        allItemsLength: allItems.length,
        virtualItemsCount: virtualItems.length,
        firstIndex,
        lastIndex,
        totalSize,
        hasNextPage: queryResult.hasNextPage,
        hasPreviousPage: queryResult.hasPreviousPage,
        isFetchingNextPage: queryResult.isFetchingNextPage,
        isFetchingPreviousPage: queryResult.isFetchingPreviousPage,
        isPending: queryResult.isPending,
        isError: queryResult.isError,
        // Calculate if we should fetch older items
        shouldFetchOlderByIndex: lastIndex >= allItems.length - PREFETCH_THRESHOLD,
        shouldFetchOlderCalc:
          lastIndex >= allItems.length - PREFETCH_THRESHOLD &&
          queryResult.hasNextPage &&
          !queryResult.isFetchingNextPage,
      },
      'SCROLL',
    );
  }, [
    allItems.length,
    virtualItems.length,
    firstIndex,
    lastIndex,
    totalSize,
    queryResult.hasNextPage,
    queryResult.hasPreviousPage,
    queryResult.isFetchingNextPage,
    queryResult.isFetchingPreviousPage,
    queryResult.isPending,
    queryResult.isError,
  ]);

  // Handle prefetching when scrolling near edges
  useEffect(() => {
    if (firstIndex === -1 || lastIndex === -1 || !queryResult.data) {
      logger.debug(
        {
          message: 'Virtualizer trigger - early return',
          firstIndex,
          lastIndex,
          hasData: !!queryResult.data,
        },
        'SCROLL',
      );
      return;
    }

    const totalCount = allItems.length;
    const now = Date.now();
    const MIN_FETCH_INTERVAL = 500; // Prevent fetches within 500ms of each other

    // Load newer items when scrolling up (within 5 items of top)
    // Load older items when scrolling down (within 5 items of bottom)
    const shouldFetchNewer =
      firstIndex <= PREFETCH_THRESHOLD &&
      queryResult.hasPreviousPage &&
      !queryResult.isFetchingPreviousPage &&
      lastFetchedRef.current.first !== firstIndex &&
      now - lastFetchedRef.current.firstTimestamp > MIN_FETCH_INTERVAL;

    // Special case: If all items are visible and we're at the bottom, we should fetch immediately
    // This handles the case where 12 posts all fit on screen (0..11 visible)
    // This ensures immediate automatic fetching when the page loads with all items visible
    const allItemsVisible = firstIndex === 0 && lastIndex === totalCount - 1 && totalCount > 0;
    // When all items are visible, bypass both the index-change check AND the time interval check
    // for the initial fetch, since we need to fetch immediately when all items fit on screen
    const indexChanged = allItemsVisible ? true : lastFetchedRef.current.last !== lastIndex;
    // If all items are visible, allow fetch even if recent (needed for immediate fetch on load)
    // Otherwise, respect the time interval to prevent rapid successive fetches
    const timeElapsed = allItemsVisible ? true : now - lastFetchedRef.current.lastTimestamp > MIN_FETCH_INTERVAL;
    const shouldFetchOlder =
      (lastIndex >= totalCount - PREFETCH_THRESHOLD || allItemsVisible) &&
      queryResult.hasNextPage &&
      !queryResult.isFetchingNextPage &&
      indexChanged &&
      timeElapsed;

    logger.info(
      {
        message: 'Virtualizer trigger - evaluating',
        firstIndex,
        lastIndex,
        totalCount,
        PREFETCH_THRESHOLD,
        shouldFetchNewer,
        shouldFetchOlder,
        hasPreviousPage: queryResult.hasPreviousPage,
        hasNextPage: queryResult.hasNextPage,
        isFetchingPreviousPage: queryResult.isFetchingPreviousPage,
        isFetchingNextPage: queryResult.isFetchingNextPage,
        lastFetchedFirst: lastFetchedRef.current.first,
        lastFetchedLast: lastFetchedRef.current.last,
        timeSinceFirstFetch: now - lastFetchedRef.current.firstTimestamp,
        timeSinceLastFetch: now - lastFetchedRef.current.lastTimestamp,
        conditionCheck: {
          indexCondition: lastIndex >= totalCount - PREFETCH_THRESHOLD,
          allItemsVisible: firstIndex === 0 && lastIndex === totalCount - 1 && totalCount > 0,
          hasNextPage: queryResult.hasNextPage,
          notFetching: !queryResult.isFetchingNextPage,
          indexChanged:
            firstIndex === 0 && lastIndex === totalCount - 1 && totalCount > 0
              ? true
              : lastFetchedRef.current.last !== lastIndex,
          timeElapsed:
            firstIndex === 0 && lastIndex === totalCount - 1 && totalCount > 0
              ? true
              : now - lastFetchedRef.current.lastTimestamp > 500,
          timeSinceLastFetch: now - lastFetchedRef.current.lastTimestamp,
        },
      },
      'SCROLL',
    );

    if (shouldFetchNewer) {
      lastFetchedRef.current.first = firstIndex;
      lastFetchedRef.current.firstTimestamp = now;
      logger.info(
        {
          message: 'Fetching previous page (newer items)',
          firstIndex,
          totalCount,
          hasPreviousPage: queryResult.hasPreviousPage,
          isFetchingPreviousPage: queryResult.isFetchingPreviousPage,
        },
        'SCROLL',
      );
      queryResult.fetchPreviousPage();
    }

    if (shouldFetchOlder) {
      lastFetchedRef.current.last = lastIndex;
      lastFetchedRef.current.lastTimestamp = now;
      logger.info(
        {
          message: 'Fetching next page (older items)',
          lastIndex,
          totalCount,
          hasNextPage: queryResult.hasNextPage,
          isFetchingNextPage: queryResult.isFetchingNextPage,
        },
        'SCROLL',
      );
      queryResult.fetchNextPage();
    }
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

  // Separate ref for scroll-based trigger to avoid conflicts with virtualizer-based trigger
  const scrollBasedLastFetchRef = useRef<number>(0);

  // Automatic immediate check: Trigger fetch when data loads if already near bottom
  // This ensures fetching happens immediately and automatically without user interaction
  // This is critical for small datasets (e.g., 12 posts) where all items might be visible
  useEffect(() => {
    if (typeof window === 'undefined' || !queryResult.data || allItems.length === 0) {
      logger.info(
        {
          message: 'Automatic check skipped - early return',
          hasWindow: typeof window !== 'undefined',
          hasData: !!queryResult.data,
          allItemsLength: allItems.length,
        },
        'SCROLL',
      );
      return;
    }

    logger.info(
      {
        message: 'Automatic check triggered',
        allItemsLength: allItems.length,
        hasNextPage: queryResult.hasNextPage,
        isFetchingNextPage: queryResult.isFetchingNextPage,
      },
      'SCROLL',
    );

    // Wait for layout to settle before checking
    const checkAndFetch = () => {
      // Check if we should fetch older items
      if (!queryResult.hasNextPage) {
        logger.info(
          {
            message: 'Automatic check - no next page available',
            hasNextPage: queryResult.hasNextPage,
          },
          'SCROLL',
        );
        return;
      }

      if (queryResult.isFetchingNextPage) {
        logger.info(
          {
            message: 'Automatic check - already fetching',
            isFetchingNextPage: queryResult.isFetchingNextPage,
          },
          'SCROLL',
        );
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if near bottom (within 500px of bottom)
      const distanceFromBottom = documentHeight - (scrollY + windowHeight);
      const SCROLL_THRESHOLD_PX = 500;

      // Also check virtualizer indices if available (read current value from virtualizer)
      const currentVirtualItems = virtualizer.getVirtualItems();
      const currentFirstIndex = currentVirtualItems.length > 0 ? currentVirtualItems[0]?.index ?? -1 : -1;
      const currentLastIndex =
        currentVirtualItems.length > 0 ? currentVirtualItems[currentVirtualItems.length - 1]?.index ?? -1 : -1;
      const totalCount = allItems.length;
      // Special case: If all items are visible, we should fetch immediately
      const allItemsVisible = currentFirstIndex === 0 && currentLastIndex === totalCount - 1 && totalCount > 0;
      const isNearBottomByIndex =
        currentLastIndex !== -1 && (currentLastIndex >= totalCount - PREFETCH_THRESHOLD || allItemsVisible);
      const isNearBottomByScroll = distanceFromBottom <= SCROLL_THRESHOLD_PX;

      logger.info(
        {
          message: 'Automatic check - evaluating conditions',
          scrollY,
          windowHeight,
          documentHeight,
          distanceFromBottom,
          SCROLL_THRESHOLD_PX,
          currentLastIndex,
          totalCount,
          PREFETCH_THRESHOLD,
          isNearBottomByIndex,
          isNearBottomByScroll,
          conditionDetails: {
            allItemsVisible,
            currentFirstIndex,
            indexCheck: `${currentLastIndex} >= ${totalCount} - ${PREFETCH_THRESHOLD} = ${
              currentLastIndex >= totalCount - PREFETCH_THRESHOLD
            }`,
            scrollCheck: `${distanceFromBottom} <= ${SCROLL_THRESHOLD_PX} = ${
              distanceFromBottom <= SCROLL_THRESHOLD_PX
            }`,
          },
        },
        'SCROLL',
      );

      if (isNearBottomByIndex || isNearBottomByScroll) {
        const now = Date.now();
        const MIN_FETCH_INTERVAL = 500;

        // When all items are visible, bypass rate limiting for immediate fetch
        // Otherwise, prevent rapid successive fetches
        if (!allItemsVisible && now - scrollBasedLastFetchRef.current <= MIN_FETCH_INTERVAL) {
          logger.info(
            {
              message: 'Automatic check - rate limited (scroll-based)',
              timeSinceLastFetch: now - scrollBasedLastFetchRef.current,
              MIN_FETCH_INTERVAL,
            },
            'SCROLL',
          );
          return;
        }

        // Check if virtualizer trigger already handled this (but bypass if all items visible)
        if (
          !allItemsVisible &&
          lastFetchedRef.current.last !== null &&
          now - lastFetchedRef.current.lastTimestamp <= MIN_FETCH_INTERVAL
        ) {
          logger.info(
            {
              message: 'Automatic check - rate limited (virtualizer)',
              timeSinceLastFetch: now - lastFetchedRef.current.lastTimestamp,
              MIN_FETCH_INTERVAL,
              lastFetchedIndex: lastFetchedRef.current.last,
            },
            'SCROLL',
          );
          return;
        }

        scrollBasedLastFetchRef.current = now;
        lastFetchedRef.current.last = allItems.length - 1;
        lastFetchedRef.current.lastTimestamp = now;
        logger.info(
          {
            message: 'Fetching next page (older items) - automatic immediate check',
            scrollY,
            documentHeight,
            distanceFromBottom,
            currentLastIndex,
            totalCount,
            isNearBottomByIndex,
            isNearBottomByScroll,
            hasNextPage: queryResult.hasNextPage,
            isFetchingNextPage: queryResult.isFetchingNextPage,
            allItemsLength: allItems.length,
          },
          'SCROLL',
        );
        queryResult.fetchNextPage();
      } else {
        logger.debug(
          {
            message: 'Automatic check - conditions not met, not fetching',
            isNearBottomByIndex,
            isNearBottomByScroll,
          },
          'SCROLL',
        );
      }
    };

    // Use requestAnimationFrame to wait for layout to settle, then check
    // Double RAF ensures we wait for the browser to paint and measure elements
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        checkAndFetch();
      });
    });
  }, [
    queryResult.data,
    allItems.length,
    queryResult.hasNextPage,
    queryResult.isFetchingNextPage,
    queryResult.fetchNextPage,
  ]);

  // Fallback: Direct scroll listener to ensure prefetch triggers when scrolling to bottom
  // This ensures older posts load even if virtualizer doesn't detect scroll changes
  // This is especially important for small datasets (e.g., 12 posts) where all items might be visible
  useEffect(() => {
    if (typeof window === 'undefined' || !queryResult.data) return;

    const handleScroll = () => {
      // Only check for loading older posts (scrolling down to bottom)
      if (!queryResult.hasNextPage || queryResult.isFetchingNextPage) {
        logger.debug(
          {
            message: 'Scroll trigger - early return',
            hasNextPage: queryResult.hasNextPage,
            isFetchingNextPage: queryResult.isFetchingNextPage,
          },
          'SCROLL',
        );
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Check if near bottom (within 500px of bottom)
      const distanceFromBottom = documentHeight - (scrollY + windowHeight);
      const SCROLL_THRESHOLD_PX = 500;

      logger.debug(
        {
          message: 'Scroll trigger - evaluating',
          scrollY,
          windowHeight,
          documentHeight,
          distanceFromBottom,
          SCROLL_THRESHOLD_PX,
          isNearBottom: distanceFromBottom <= SCROLL_THRESHOLD_PX,
        },
        'SCROLL',
      );

      if (distanceFromBottom <= SCROLL_THRESHOLD_PX) {
        const now = Date.now();
        const MIN_FETCH_INTERVAL = 500;

        // Prevent rapid successive fetches using separate ref for scroll-based trigger
        if (now - scrollBasedLastFetchRef.current <= MIN_FETCH_INTERVAL) {
          logger.debug(
            {
              message: 'Scroll trigger - rate limited',
              timeSinceLastFetch: now - scrollBasedLastFetchRef.current,
              MIN_FETCH_INTERVAL,
            },
            'SCROLL',
          );
          return;
        }

        scrollBasedLastFetchRef.current = now;
        // Also update shared ref to prevent virtualizer trigger from firing immediately after
        lastFetchedRef.current.last = allItems.length - 1;
        lastFetchedRef.current.lastTimestamp = now;
        logger.info(
          {
            message: 'Fetching next page (older items) - scroll-based trigger',
            scrollY,
            documentHeight,
            distanceFromBottom,
            hasNextPage: queryResult.hasNextPage,
            isFetchingNextPage: queryResult.isFetchingNextPage,
            allItemsLength: allItems.length,
          },
          'SCROLL',
        );
        queryResult.fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check immediately in case already at bottom
    handleScroll();

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [
    queryResult.hasNextPage,
    queryResult.isFetchingNextPage,
    queryResult.fetchNextPage,
    queryResult.data,
    allItems.length,
  ]);

  // Loading state - maintain container structure to prevent layout shift
  // This ensures "Feed" header and "Create Post" don't flicker during slow network loads
  if (queryResult.isPending) {
    return (
      <div ref={parentRef} className={className} style={containerStyle}>
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
            {}
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
            {}
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
          {!queryResult.isFetchingNextPage && !queryResult.hasNextPage && (
            <div className="p-4" data-scroll-state="all-caught-up">
              <AllCaughtUp showOlderPostsMessage={false} />
            </div>
          )}
          {/* Debug indicator - only in development, shows current state */}
          {process.env.NODE_ENV === 'development' && logger.isDebugChannelEnabled('SCROLL') && (
            <div
              className="fixed bottom-4 right-4 z-50 rounded-lg bg-black/80 px-3 py-2 text-xs text-white opacity-75"
              data-scroll-debug
              style={DEBUG_STYLE}>
              <div>Items: {allItems.length}</div>
              <div>
                Visible: {virtualItems.length} ({firstIndex}..{lastIndex})
              </div>
              <div>
                {queryResult.isFetchingNextPage
                  ? '⬇️ Fetching older'
                  : queryResult.hasNextPage
                  ? '⬇️ Has more'
                  : '⬇️ End'}
              </div>
              <div>
                {queryResult.isFetchingPreviousPage
                  ? '⬆️ Fetching newer'
                  : queryResult.hasPreviousPage
                  ? '⬆️ Has more'
                  : '⬆️ End'}
              </div>
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
        {}
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
        {}
      </div>
      {queryResult.isFetchingNextPage && (
        <div className="p-4 text-center" data-scroll-state="fetching-next">
          <GenericLoading>Loading older items...</GenericLoading>
        </div>
      )}
      {queryResult.isFetchingPreviousPage && (
        <div className="p-4 text-center" data-scroll-state="fetching-previous">
          <GenericLoading>Loading newer items...</GenericLoading>
        </div>
      )}
      {!queryResult.isFetchingNextPage && !queryResult.hasNextPage && (
        <div className="p-4" data-scroll-state="all-caught-up">
          <AllCaughtUp showOlderPostsMessage />
        </div>
      )}
      {/* Debug indicator - only in development, shows current state */}
      {process.env.NODE_ENV === 'development' && (
        <div
          className="fixed bottom-4 right-4 z-50 rounded-lg bg-black/80 px-3 py-2 text-xs text-white opacity-75"
          data-scroll-debug
          style={DEBUG_STYLE}>
          <div>Items: {allItems.length}</div>
          <div>
            Visible: {virtualItems.length} ({firstIndex}..{lastIndex})
          </div>
          <div>
            {queryResult.isFetchingNextPage ? '⬇️ Fetching older' : queryResult.hasNextPage ? '⬇️ Has more' : '⬇️ End'}
          </div>
          <div>
            {queryResult.isFetchingPreviousPage
              ? '⬆️ Fetching newer'
              : queryResult.hasPreviousPage
              ? '⬆️ Has more'
              : '⬆️ End'}
          </div>
        </div>
      )}
    </div>
  );
}
