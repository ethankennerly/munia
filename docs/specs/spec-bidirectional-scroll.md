# Tech Spec: Bidirectional Scroll

Virtualized bidirectional scrolling for dynamic feeds with prefetching and layout shift prevention.

## Acceptance Criteria

- [x] Newer posts are sorted from top to bottom. The bottom is the older posts. 
- [x] At the bottom of a toast should mention "older posts."
- [x] Load newer items when scrolling up (within 5 items of top)
- [x] Load older items when scrolling down (within 5 items of bottom)
- [x] Four or more new posts just created appear.
- [x] When the browser does a hard reload, and the browser keeps scrolling to the bottom eventually all the old posts may load. Generic Loading spinner appears at the bottom while loading. Example: 30 posts in database. Scroll to bottom of feed. Being near the bottom of the feed should trigger loading the next page of posts.
- [x] When more posts are pending, animate the Generic Loading spinner.
- [x] At Network Throtting Fast 4G, being near the bottom of the page of 6 or 12 posts should fetch the next page of posts. During this loading, the loading spinner should appear. 
  - [x] This should happen immediately and automatically. There should not be a need for the user to resize the browser window until the sidebar collapses into the mobile menu or vice versa. 
  - [x] The visual rendering of the browser window should be displaying the loading spinner or the newly loaded posts. The user should not need to revise the window layout to see the loading or new items.
- [x] Handle loading states (show indicators during fetch)
- [x] Handle error states (show error UI, allow retry)
- [x] Handle empty states (no more items to load)
- [x] Consistent spacing between item.
- [x] No extra scroll bar. There is already a vertical scroll bar for the whole page.
- [x] Some items have different heights.
- [x] Consistent margin between scroll and other items. Example: Create Post is above the fetched posts. The spacing should be equal between Create Post and the top post. Ideally, the format appears as equal spacing and equal margins.
- [x] After the oldest post in the database is loaded, and the user scrolls to the bottom, at the bottom of the page display the pre-existing UI that has text like "All Caught Up."
- [x] Virtualize list (render only visible items + overscan)
- [x] Prevent layout shift (fixed height estimation or skeleton loading)

## Out of Scope
- [ ] Prefetch 10 items ahead/behind viewport (overscan: 10)
- [ ] At Network Throttling Slow 4G or Fast 4G, the "Feed" and Create Post appeared at the top of the page. This should persist as loading continues. There should not be any flicker or removal of those items while loading posts.
- [ ] Do not block the main thread while fetching posts.
- [ ] Delay network requests of images or videos in post to speed up loading of the post.
- [ ] Restore the pre-existing function of post `AnimatePresence` with `framer-motion`. Yet implement simply and professionally.

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