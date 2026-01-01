# Tech Spec: Bidirectional Scroll

Virtualized bidirectional scrolling for dynamic feeds with prefetching and layout shift prevention.

## Acceptance Criteria

- [x] Load older items when scrolling up (within 5 items of top)
- [x] Load newer items when scrolling down (within 5 items of bottom)
- [x] Prefetch 10 items ahead/behind viewport (overscan: 10)
- [x] Virtualize list (render only visible items + overscan)
- [x] Prevent layout shift (fixed height estimation or skeleton loading)
- [x] Handle loading states (show indicators during fetch)
- [x] Handle error states (show error UI, allow retry)
- [x] Handle empty states (no more items to load)
- [x] Consistent spacing between item.
- [x] Some items have different heights.
- [x] No extra scroll bar. There is already a vertical scroll bar for the whole page.
- [ ] Consistent margin between scroll and other items. Example: Create Post is above the fetched posts. The spacing should be equal between Create Post and the top post. Ideally, the format appears as equal spacing and equal margins.

## Out of Scope
- `AnimatePresence` with `framer-motion`.

## Implementation

**Data Management**: Use `useInfiniteQuery` for bidirectional pagination:
- `fetchNextPage()`: Load older items (backward direction)
- `fetchPreviousPage()`: Load newer items (forward direction)
- `getNextPageParam`: Return cursor for older items
- `getPreviousPageParam`: Return cursor for newer items
- Pass `direction: 'forward' | 'backward'` in `pageParam` to API

**DOM Performance**: Use `@tanstack/virtual-core` (`useVirtualizer`):
- `estimateSize`: Fixed height or dynamic measurement
- `overscan`: 10 items
- `getScrollElement`: Container ref
- `onChange`: Trigger prefetch when near edges

**Prefetch Triggers**:
- When first visible item index ≤ 5: call `fetchNextPage()` (load older)
- When last visible item index ≥ totalCount - 5: call `fetchPreviousPage()` (load newer)
- Guard: Check `hasNextPage`/`hasPreviousPage` and `isFetching` before fetching

**Layout Shift Prevention**:
- Use fixed `estimateSize` for uniform items
- Use skeleton placeholders during initial load
- Measure dynamic heights and cache in virtualizer

### Integration

- Implementation file: [BidirectionalScroll.tsx](../../src/components/ui/BidirectionalScroll.tsx).
- The log channel name is `SCROLL`.
- The class named [Posts.tsx](../../src/components/Posts.tsx) completely replaces its pre-existing bidirectional scroll with this one. The replacement is as simple as possible without attempting to maintain any old features of the bidirectional scroll. The replacement should be manually verifiable.