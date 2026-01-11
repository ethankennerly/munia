import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider, InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';
import BidirectionalScroll from './BidirectionalScroll';

// Mock @tanstack/react-virtual
const mockGetVirtualItems = vi.fn(() => []);
const mockGetTotalSize = vi.fn(() => 0);
const mockUseVirtualizer = vi.fn();

vi.mock('@tanstack/react-virtual', () => ({
  useVirtualizer: (config: unknown) => mockUseVirtualizer(config),
}));

describe('BidirectionalScroll', () => {
  let queryClient: QueryClient;
  let mockQueryResult: Partial<UseInfiniteQueryResult<unknown[], Error>>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();

    // Setup default mock return
    mockGetVirtualItems.mockReturnValue([]);
    mockGetTotalSize.mockReturnValue(0);
    mockUseVirtualizer.mockReturnValue({
      getVirtualItems: mockGetVirtualItems,
      getTotalSize: mockGetTotalSize,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const createMockQueryResult = (
    overrides?: Partial<UseInfiniteQueryResult<unknown[], Error>>,
  ): Partial<UseInfiniteQueryResult<unknown[], Error>> => ({
    data: {
      pages: [[{ id: 1, content: 'Item 1' }], [{ id: 2, content: 'Item 2' }]],
      pageParams: [undefined, 1],
    } as InfiniteData<unknown[]>,
    isPending: false,
    isError: false,
    error: null,
    fetchNextPage: vi.fn(),
    fetchPreviousPage: vi.fn(),
    hasNextPage: true,
    hasPreviousPage: true,
    isFetchingNextPage: false,
    isFetchingPreviousPage: false,
    ...overrides,
  });

  const defaultRenderItem = (item: { id: number; content: string }) => <div>{item.content}</div>;

  const renderComponent = (
    queryResult: Partial<UseInfiniteQueryResult<unknown[], Error>>,
    renderItem = defaultRenderItem,
  ) =>
    render(
      <QueryClientProvider client={queryClient}>
        <BidirectionalScroll
          queryResult={queryResult as UseInfiniteQueryResult<unknown[], Error>}
          renderItem={renderItem}
        />
      </QueryClientProvider>,
    );

  it('renders loading state when data is pending', () => {
    mockQueryResult = createMockQueryResult({ isPending: true, data: undefined });
    renderComponent(mockQueryResult);

    expect(screen.getByText(/loading items/i)).toBeInTheDocument();
  });

  it('renders error state when query fails', () => {
    mockQueryResult = createMockQueryResult({
      isError: true,
      error: new Error('Failed to fetch'),
    });
    renderComponent(mockQueryResult);

    // Should display the actual error message
    expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
  });

  it('renders empty state when no items available', () => {
    mockQueryResult = createMockQueryResult({
      data: { pages: [], pageParams: [] } as InfiniteData<unknown[]>,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    renderComponent(mockQueryResult);

    expect(screen.getByText(/all_caught_up/i)).toBeInTheDocument();
  });

  it('renders virtualized items from query data', () => {
    mockQueryResult = createMockQueryResult();

    const mockVirtualItems = [
      { key: '1', index: 0, start: 0, size: 60 },
      { key: '2', index: 1, start: 60, size: 60 },
    ];

    mockGetVirtualItems.mockReturnValue(mockVirtualItems);
    mockGetTotalSize.mockReturnValue(120);

    renderComponent(mockQueryResult);

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('calls fetchNextPage when scrolling near top (index <= 5)', async () => {
    const mockFetchNextPage = vi.fn();
    mockQueryResult = createMockQueryResult({
      fetchNextPage: mockFetchNextPage,
    });

    const mockVirtualItems = [{ key: '1', index: 3, start: 0, size: 60 }];
    mockGetVirtualItems.mockReturnValue(mockVirtualItems);
    mockGetTotalSize.mockReturnValue(120);

    renderComponent(mockQueryResult);

    await waitFor(() => {
      expect(mockFetchNextPage).toHaveBeenCalled();
    });
  });

  it('calls fetchNextPage when scrolling near bottom (index >= totalCount - 5)', async () => {
    const mockFetchNextPage = vi.fn();
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i, content: `Item ${i}` }));
    mockQueryResult = createMockQueryResult({
      data: {
        pages: [items],
        pageParams: [undefined],
      } as InfiniteData<unknown[]>,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: true,
    });

    const totalCount = 20;
    const mockVirtualItems = [{ key: '1', index: totalCount - 3, start: 0, size: 60 }];
    mockGetVirtualItems.mockReturnValue(mockVirtualItems);
    mockGetTotalSize.mockReturnValue(1200);

    renderComponent(mockQueryResult);

    await waitFor(() => {
      expect(mockFetchNextPage).toHaveBeenCalled();
    });
  });

  it('does not fetch when already fetching', async () => {
    const mockFetchNextPage = vi.fn();
    mockQueryResult = createMockQueryResult({
      isFetchingNextPage: true,
      fetchNextPage: mockFetchNextPage,
    });

    const mockVirtualItems = [{ key: '1', index: 3, start: 0, size: 60 }];
    mockGetVirtualItems.mockReturnValue(mockVirtualItems);
    mockGetTotalSize.mockReturnValue(120);

    renderComponent(mockQueryResult);

    // Wait a bit to ensure effect runs
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });

    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('does not fetch when no more pages available', async () => {
    const mockFetchNextPage = vi.fn();
    mockQueryResult = createMockQueryResult({
      hasNextPage: false,
      fetchNextPage: mockFetchNextPage,
    });

    const mockVirtualItems = [{ key: '1', index: 3, start: 0, size: 60 }];
    mockGetVirtualItems.mockReturnValue(mockVirtualItems);
    mockGetTotalSize.mockReturnValue(120);

    renderComponent(mockQueryResult);

    // Wait a bit to ensure effect runs
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });

    expect(mockFetchNextPage).not.toHaveBeenCalled();
  });

  it('configures virtualizer with overscan of 10', () => {
    mockQueryResult = createMockQueryResult();
    renderComponent(mockQueryResult);

    expect(mockUseVirtualizer).toHaveBeenCalled();
    const config = mockUseVirtualizer.mock.calls[0][0];
    expect(config.overscan).toBe(10);
  });

  it('configures virtualizer with correct count from flattened pages', () => {
    mockQueryResult = createMockQueryResult();
    renderComponent(mockQueryResult);

    expect(mockUseVirtualizer).toHaveBeenCalled();
    const config = mockUseVirtualizer.mock.calls[0][0];
    // Should be 2 items (one from each page)
    expect(config.count).toBe(2);
  });

  it('shows loading indicator when fetching next page', () => {
    mockQueryResult = createMockQueryResult({
      isFetchingNextPage: true,
    });
    renderComponent(mockQueryResult);

    expect(screen.getByText(/loading older items/i)).toBeInTheDocument();
  });

  it('shows loading indicator when fetching previous page', () => {
    mockQueryResult = createMockQueryResult({
      isFetchingPreviousPage: true,
    });
    renderComponent(mockQueryResult);

    expect(screen.getByText(/loading newer items/i)).toBeInTheDocument();
  });

  it('animates spinner when fetching next page (posts pending)', () => {
    mockQueryResult = createMockQueryResult({
      isFetchingNextPage: true,
    });
    const { container } = renderComponent(mockQueryResult);

    // Find the spinner SVG element (it should have animate-spin class)
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('animates spinner when fetching previous page (posts pending)', () => {
    mockQueryResult = createMockQueryResult({
      isFetchingPreviousPage: true,
    });
    const { container } = renderComponent(mockQueryResult);

    // Find the spinner SVG element (it should have animate-spin class)
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('shows "components_allcaughtup" when no more pages and not fetching', () => {
    mockQueryResult = createMockQueryResult({
      hasNextPage: false,
      hasPreviousPage: false,
      isFetchingNextPage: false,
      isFetchingPreviousPage: false,
      data: {
        pages: [[{ id: 1, content: 'Item 1' }]],
        pageParams: [undefined],
      } as InfiniteData<unknown[]>,
    });
    renderComponent(mockQueryResult);

    expect(screen.getByText(/components_allcaughtup/i)).toBeInTheDocument();
  });
});
