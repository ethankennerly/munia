import { PostSkeletonList } from '@/components/PostSkeleton';
import { FeedHeaderSkeleton } from '@/components/FeedHeader';

export default function Loading() {
  return (
    <main>
      <div className="px-4 pt-4">
        <FeedHeaderSkeleton />

        {/* Post skeletons */}
        <PostSkeletonList count={3} />
      </div>
    </main>
  );
}
