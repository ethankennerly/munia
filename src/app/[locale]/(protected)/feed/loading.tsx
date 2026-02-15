import { PostSkeletonList } from '@/components/PostSkeleton';

export default function Loading() {
  return (
    <main>
      <div className="px-4 pt-4">
        {/* FeedHeader skeleton: "Feed" title (text-2xl≈h-8) */}
        <div className="mb-4 flex items-center justify-between">
          <div className="animate-shimmer h-8 w-20 rounded" />
        </div>

        {/* CreatePostModalLauncher skeleton: rounded-xl bg-card, avatar + text + media button */}
        <div className="mb-4 rounded-xl bg-card px-4 py-4 shadow sm:px-8 sm:py-5">
          <div className="mb-[18px] flex flex-row">
            <div className="animate-shimmer mr-3 h-12 w-12 rounded-full" />
            <div className="flex flex-grow flex-col justify-center">
              <div className="animate-shimmer h-5 w-40 rounded" />
            </div>
          </div>
          <div className="flex flex-row gap-4">
            <div className="animate-shimmer h-8 w-8 rounded" />
          </div>
        </div>

        {/* Post skeletons */}
        <PostSkeletonList count={3} />
      </div>
    </main>
  );
}
