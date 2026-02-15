import { PostSkeletonList } from '@/components/PostSkeleton';

/**
 * Route-level loading for all protected pages.
 * Shows post skeletons since /feed is the most common landing page.
 */
export default function Loading() {
  return (
    <div className="px-4 pt-4" aria-busy="true">
      {/* Page title placeholder */}
      <div className="mb-4">
        <div className="animate-shimmer h-8 w-32 rounded" />
      </div>
      <PostSkeletonList count={3} />
    </div>
  );
}
