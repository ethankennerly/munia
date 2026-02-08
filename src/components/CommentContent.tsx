import { cn } from '@/lib/cn';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useTimeAgo } from '@/hooks/useTimeAgo';
import { useTranslations } from 'next-intl';
import { HighlightedMentionsAndHashTags } from './HighlightedMentionsAndHashTags';

export function CommentContent({
  name,
  username,
  content,
  createdAt,
  shouldHighlight,
}: {
  name: string | null;
  username: string | null;
  content: string;
  createdAt: string | Date;
  shouldHighlight?: boolean;
}) {
  const { formatTimeAgo } = useTimeAgo();
  const t = useTranslations();
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  // Count lines by splitting on newlines
  const lineCount = useMemo(() => {
    if (!content) return 0;
    return content.split('\n').length;
  }, [content]);

  const shouldTruncate = lineCount > 3;

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!shouldHighlight) return;
    if (ref.current) ref.current.scrollIntoView({ behavior: 'smooth' });
  }, [shouldHighlight]);

  return (
    <div ref={ref}>
      <h3 className="text-md font-semibold">
        <Link href={`/${username}`} className="link text-foreground">
          {name}
        </Link>
      </h3>
      <p className="text-muted-foreground">@{username}</p>
      <div
        className={cn(
          'my-2 w-full rounded-[32px] rounded-ss-none px-6 py-3',
          !shouldHighlight ? 'border border-input' : 'ring-2 ring-primary',
        )}>
        <div className={cn('mb-1 break-words text-foreground', !isExpanded && shouldTruncate && 'line-clamp-3')}>
          <HighlightedMentionsAndHashTags text={content} shouldAddLinks />
        </div>
        {shouldTruncate && (
          <button
            type="button"
            onClick={handleToggle}
            className="mb-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            {isExpanded ? t('components_show_less') : t('components_show_more')}
          </button>
        )}
        <p className="ml-auto text-sm text-muted-foreground">{formatTimeAgo(new Date(createdAt))}</p>
      </div>
    </div>
  );
}
