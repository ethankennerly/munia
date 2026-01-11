'use client';

import { ButtonLink } from '@/components/ui/ButtonLink';
import { ButtonAnchor } from '@/components/ui/ButtonAnchor';
import React from 'react';
import { useTranslations } from 'next-intl';

function TechStackCard({ header, children }: { header: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-border bg-card p-5">
      <h3 className="text-lg font-semibold text-card-foreground">{header}</h3>

      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}

export default function Page() {
  const t = useTranslations();
  return (
    <main>
      <div className="mt-4 flex flex-col items-center">
        <h1 className="mt-4 text-center sm:text-5xl">{t('what_and_apos_s_new')}</h1>
        <div className="m-6 flex justify-center gap-3">
          <p className="w-1/2 text-muted-foreground">
            {t('in_this')}{' '}
            <a
              className="text-primary underline hover:text-primary-accent"
              target="_blank"
              href="https://github.com/ethankennerly/munia"
              data-activate-id="github-kennerly"
              rel="noreferrer">
              fork
            </a>
            {t('ethan_kennerly_enhanced_the_following_fe')}
          </p>
          <ol className="w-1/2 list-disc rounded-lg bg-card px-6 py-2 text-muted-foreground">
            <li>
              {t('patched_dos_vulnerability')}
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components"
                rel="noreferrer">
                2025-12-11
              </a>
              {t('key')}
            </li>
            <li>
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://www.lexology.com/library/detail.aspx?g=a20bdb6d-dffa-4936-8507-3201876b891b"
                rel="noreferrer">
                {t('delete')}
              </a>{' '}
              {t('an_account')}
            </li>
            <li>
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://github.com/leandronorcio/munia/issues/1"
                rel="noreferrer">
                {t('remove')}
              </a>{' '}
              {t('a_post')}
            </li>
            <li> {t('unprotected_page_resolve')} </li>
            <li> {t('configure_email_facebook_github_or_googl')} </li>
            <li> {t('import_profile_picture_from_google')} </li>
            <li>
              {t('link_google_or_github_by_email')}
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://www.bitdefender.com/en-us/blog/labs/attackers-pose-as-account-owners-via-facebook-login-flaw"
                rel="noreferrer">
                {t('facebook')}
              </a>{' '}
              {t('linking_is_unsafe')}
            </li>
            <li>
              {' '}
              {t('speed_up_reloading_an')}{' '}
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://developer.chrome.com/docs/performance/insights/cache"
                rel="noreferrer">
                image
              </a>
            </li>
            <li> {t('collapse_a_long_post')} </li>
            <li> {t('fixed_birth_date_editing')} </li>
            <li> {t('terms_of_service')} </li>
            <li> {t('privacy_policy')} </li>
            <li> {t('admin_replays_clicks_and_scrolling')} </li>
          </ol>
        </div>
        <a href="https://twitter.com/norciodotdev" data-activate-id="follow-x">
          <p className="inline-block rounded-lg bg-card px-3 py-2 text-card-foreground">
            {t('follow_leandro_norcio_on_x')}
          </p>
        </a>
        <h1 className="mt-4 px-5 text-center text-2xl sm:text-5xl">{t('a_responsive_and_accessible_full_stack_s')}</h1>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/login" size="medium" data-activate-id="get-started">
            {t('get_started')}
          </ButtonLink>
          <ButtonAnchor
            href="https://github.com/leandronorcio/munia"
            size="medium"
            mode="secondary"
            data-activate-id="github-norcio">
            {t('github')}
          </ButtonAnchor>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-center text-3xl sm:text-5xl">{t('technology_stack')}</h2>
        <p className="mt-2 px-4 text-center text-lg text-muted-foreground">
          {t('this_social_media_web_app_is_built_using')}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 px-4 md:grid-cols-3">
          {[
            {
              header: 'TypeScript',
              details: t('strongly-typed_code_and_components_for_m'),
            },
            {
              header: `${t('next_js')} 16`,
              details: t('app_router_route_handlers_nested_layouts'),
            },
            { header: `${t('react')} 19`, details: t('server_and_client_components') },
            {
              header: t('prisma'),
              details: t('type-safe_and_intuitive_database_orm'),
            },
            {
              header: `${t('nextauth_js')} 5`,
              details: t('secure_email_and_social_oauth_logins'),
            },
            {
              header: t('react_query'),
              details: t('efficient_data-fetching_and_caching'),
            },
            {
              header: t('tailwind_css'),
              details: t('utility_classes_for_building_components'),
            },
            { header: t('framer_motion'), details: t('animation_for_components') },
            {
              header: t('react_aria'),
              details: t('provides_accessibility_hooks_for_compone'),
            },
            { header: t('zod'), details: t('form_input_validation') },
            { header: t('aws_s3'), details: t('storage_for_photos_and_videos') },
            { header: t('aws_ses'), details: t('for_sending_vefirication_emails') },
          ].map(({ header, details }) => (
            <TechStackCard header={header} key={header}>
              {details}
            </TechStackCard>
          ))}
        </div>
      </div>
    </main>
  );
}
