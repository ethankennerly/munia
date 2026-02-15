/**
 * Route-level loading for /[username] while profile layout resolves.
 * Shows a profile header skeleton: cover photo + avatar + name/stats.
 */
export default function Loading() {
  return (
    <div className="pb-0" aria-busy="true">
      <div className="pr-0 md:pr-4">
        {/* Cover photo placeholder */}
        <div className="animate-shimmer h-48 w-full rounded-b-2xl sm:h-64" />
        {/* Avatar + name + stats */}
        <div className="-mt-12 flex flex-col items-center gap-2">
          <div className="animate-shimmer h-24 w-24 rounded-full border-4 border-card" />
          <div className="animate-shimmer h-7 w-40 rounded" />
          <div className="animate-shimmer h-5 w-24 rounded" />
          <div className="mt-2 flex gap-6">
            <div className="animate-shimmer h-5 w-24 rounded" />
            <div className="animate-shimmer h-5 w-24 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
