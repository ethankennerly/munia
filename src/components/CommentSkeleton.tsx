/**
 * Shimmer skeleton placeholder for a Comment.
 * Sized to match <Comment />: h-10 w-10 avatar, CommentContent (name text-md≈h-5,
 * @username text-muted≈h-4, content 1-2 lines text≈h-4), ToggleStepper + reply button.
 */
export function CommentSkeleton() {
  return (
    <div className="flex gap-4 py-2" aria-hidden="true">
      {/* Avatar: matches Comment h-10 w-10 */}
      <div className="animate-shimmer h-10 w-10 flex-shrink-0 rounded-full" />

      <div className="min-w-0 flex-1">
        {/* CommentContent: name(text-md≈h-5) + @username(h-4) + content(h-4 × 1-2 lines) */}
        <div className="space-y-1">
          <div className="animate-shimmer h-5 w-24 rounded" />
          <div className="animate-shimmer h-4 w-16 rounded" />
          <div className="animate-shimmer h-4 w-full rounded" />
          <div className="animate-shimmer h-4 w-2/3 rounded" />
        </div>

        {/* Action buttons: ToggleStepper(h-10 w-20) + reply Button(h-10) */}
        <div className="mt-1 flex gap-2">
          <div className="animate-shimmer h-10 w-16 rounded-full" />
          <div className="animate-shimmer h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CommentSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <CommentSkeleton key={i} />
      ))}
    </div>
  );
}
