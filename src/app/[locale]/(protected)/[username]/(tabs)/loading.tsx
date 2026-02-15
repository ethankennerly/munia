import { PostSkeletonList } from '@/components/PostSkeleton';

/**
 * Route-level loading for profile tabs.
 * Shows post skeletons since /posts is the default tab.
 */
export default function Loading() {
  return (
    <div className="px-4 pt-4" aria-busy="true">
      <PostSkeletonList count={3} />
    </div>
  );
}
