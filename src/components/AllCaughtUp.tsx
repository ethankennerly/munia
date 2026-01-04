'use client';

import { CircleActionsSuccess } from '@/svg_components';
import { useTranslations } from 'next-intl';

interface AllCaughtUpProps {
  showOlderPostsMessage?: boolean;
}

export function AllCaughtUp({ showOlderPostsMessage = false }: AllCaughtUpProps) {
  const t = useTranslations();
  return (
    <div className="grid place-items-center">
      <div className="inline-block rounded-xl bg-success px-8 py-6">
        <div className="flex items-center gap-4">
          <CircleActionsSuccess className="stroke-success-foreground" width={24} height={24} />
          <p className="text-lg font-semibold text-success-foreground">
            {showOlderPostsMessage ? t('components_allcaughtup') : t('all_caught_up')}
          </p>
        </div>
      </div>
    </div>
  );
}
