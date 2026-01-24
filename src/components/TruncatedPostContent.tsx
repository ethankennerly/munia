'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/cn';
import { useTranslations } from 'next-intl';
import { HighlightedMentionsAndHashTags } from './HighlightedMentionsAndHashTags';

interface TruncatedPostContentProps {
  content: string;
}

export function TruncatedPostContent({ content }: TruncatedPostContentProps) {
  const t = useTranslations();
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

  if (!content) return null;

  return (
    <div className="mb-4 mt-5">
      <div className={cn('break-words text-lg text-muted-foreground', !isExpanded && shouldTruncate && 'line-clamp-3')}>
        <HighlightedMentionsAndHashTags text={content} shouldAddLinks />
      </div>
      {shouldTruncate && (
        <button
          type="button"
          onClick={handleToggle}
          className="mt-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          {isExpanded ? t('components_show_less') : t('components_show_more')}
        </button>
      )}
    </div>
  );
}
