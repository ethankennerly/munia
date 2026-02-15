/**
 * Shimmer skeleton for an Activity/Notification card.
 * Sized to match <ActivityCard />: h-16/sm:h-20 avatar with icon overlay,
 * text line + time line, optional unread dot.
 */
export function ActivitySkeleton() {
  return (
    <div className="mb-4 flex gap-3 rounded-3xl bg-card p-4 last:mb-0" aria-hidden="true">
      {/* Avatar: h-16 w-16 sm:h-20 sm:w-20 with activity icon overlay */}
      <div className="relative h-16 w-16 flex-shrink-0 sm:h-20 sm:w-20">
        <div className="animate-shimmer h-full w-full rounded-full" />
      </div>

      {/* Content: action text (~2 lines) + time */}
      <div className="my-auto flex-1 space-y-2">
        <div className="animate-shimmer h-4 w-full rounded" />
        <div className="animate-shimmer h-4 w-3/5 rounded" />
        <div className="animate-shimmer h-3 w-16 rounded" />
      </div>

      {/* Unread dot placeholder */}
      <div className="grid place-items-center">
        <div className="animate-shimmer h-3 w-3 rounded-full" />
      </div>
    </div>
  );
}

export function ActivitySkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <ActivitySkeleton key={i} />
      ))}
    </div>
  );
}
