import { PostIds } from '@/types/definitions';

export type InfiniteDataLike<T> = {
  pages: T[];
  pageParams: unknown[];
};

/**
 * Compute pageParams for React Query infinite data:
 * - First param is undefined (initial page)
 * - Subsequent params are the last post id of each preceding page
 */
export function computePageParams(pages: PostIds[]): unknown[] {
  if (!Array.isArray(pages) || pages.length === 0) return [];
  const params: unknown[] = [undefined];
  for (let i = 0; i < pages.length - 1; i += 1) {
    const page = Array.isArray(pages[i]) ? pages[i] : [];
    // Only push a pageParam when the preceding page has at least one item
    if (page.length > 0) {
      params.push(page[page.length - 1]?.id);
    }
  }
  return params;
}

/**
 * Rebuild InfiniteData after removing a post id. Ensures:
 * - pages is an array of arrays (no undefined entries)
 * - pageParams aligns with pages length
 * - empty result returns pages: [], pageParams: []
 */
export function rebuildAfterRemoval(
  oldData: InfiniteDataLike<PostIds> | undefined,
  removedId: number,
  postsPerPage: number,
): InfiniteDataLike<PostIds> | undefined {
  if (!oldData) return oldData;
  const flat = (oldData.pages || []).flat().filter(Boolean) as PostIds;
  const filtered = flat.filter((p) => p.id !== removedId);
  // chunk manually to avoid lodash dependency here
  const pages: PostIds[] = [];
  if (filtered.length > 0) {
    for (let i = 0; i < filtered.length; i += postsPerPage) {
      pages.push(filtered.slice(i, i + postsPerPage));
    }
  }
  const pageParams = computePageParams(pages);
  return { pages, pageParams };
}
