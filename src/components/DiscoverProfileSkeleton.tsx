/**
 * Shimmer skeleton for a DiscoverProfile card.
 * Sized to match <DiscoverProfile />: gradient header (py-8 + h-24 avatar + action buttons ≈ 200px),
 * card footer (py-8 + name h-7 + bio h-5 + follower/following stats h-7 ≈ 160px).
 * Total card height ≈ 360px.
 */
export function DiscoverProfileSkeleton() {
  return (
    <div className="gap-4 drop-shadow-sm" aria-hidden="true">
      {/* Gradient header: py-8 + h-24 avatar + action buttons */}
      <div className="flex flex-col items-center gap-4 rounded-t-3xl bg-muted/70 py-8">
        <div className="animate-shimmer h-24 w-24 rounded-full" />
        {/* Action buttons placeholder (Follow/Message) */}
        <div className="flex gap-2">
          <div className="animate-shimmer h-10 w-24 rounded-full" />
          <div className="animate-shimmer h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Card footer: name + bio + follower/following */}
      <div className="flex flex-col items-center rounded-b-3xl bg-card py-8">
        <div className="animate-shimmer mb-3 h-7 w-40 rounded" />
        <div className="animate-shimmer mb-4 h-5 w-48 rounded" />
        <div className="flex gap-6">
          <div className="animate-shimmer h-7 w-24 rounded" />
          <div className="animate-shimmer h-7 w-24 rounded" />
        </div>
      </div>
    </div>
  );
}

export function DiscoverProfileSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <DiscoverProfileSkeleton key={i} />
      ))}
    </div>
  );
}
