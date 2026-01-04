'use client';

import { TabButton } from '@/components/TabButton';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function Tabs({ isOwnProfile }: { isOwnProfile: boolean }) {
  const t = useTranslations();
  const selectedSegment = useSelectedLayoutSegment();
  const pathname = usePathname() ?? '';
  const parentLayoutSegment = pathname;

  return (
    <div className="mt-4 inline-flex flex-row gap-6 overflow-x-auto border-b-[1px] border-muted">
      {[
        { title: t('posts'), segment: '../posts' },
        { title: t('photos'), segment: '../photos' },
        { title: t('about'), segment: '../about' },
        ...[isOwnProfile ? { title: t('activity'), segment: '../activity' } : undefined],
      ].map((item) => {
        if (!item) return null;
        const { title, segment } = item;
        const isActive =
          (selectedSegment === null ? parentLayoutSegment : `${parentLayoutSegment}/${selectedSegment}`) === segment;
        return <TabButton key={segment} title={title} isActive={isActive} href={`${parentLayoutSegment}/${segment}`} />;
      })}
    </div>
  );
}
