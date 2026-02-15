/**
 * Shimmer skeleton placeholder for a Post card.
 * Sized to match <Post />: ProfileBlock (h-12 avatar, text-lg name, text-sm time),
 * TruncatedPostContent (text-lg ~2 lines), optional image, ToggleStepper action bar.
 */
export function PostSkeleton() {
  return (
    <div className="rounded-2xl bg-card px-4 shadow sm:px-8" aria-hidden="true">
      {/* Header: matches ProfileBlock - h-12 avatar, gap-3, name(text-lg≈h-5) + time(text-sm≈h-4) */}
      <div className="flex items-center gap-3 pt-4 sm:pt-5">
        <div className="animate-shimmer h-12 w-12 flex-shrink-0 rounded-full" />
        <div className="flex flex-col gap-1">
          <div className="animate-shimmer h-5 w-32 rounded" />
          <div className="animate-shimmer h-4 w-20 rounded" />
        </div>
      </div>

      {/* Content: matches TruncatedPostContent - mb-4 mt-5, text-lg ≈ 28px line-height × 2 lines */}
      <div className="mb-4 mt-5 space-y-2">
        <div className="animate-shimmer h-5 w-full rounded" />
        <div className="animate-shimmer h-5 w-3/4 rounded" />
      </div>

      {/* Action bar: matches ToggleStepper (rounded-full px-4 py-2 + h-6 icon ≈ h-10) × 2, gap-2 */}
      <div className="flex gap-2 border-y border-y-border py-2">
        <div className="animate-shimmer h-10 w-20 rounded-full" />
        <div className="animate-shimmer h-10 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
