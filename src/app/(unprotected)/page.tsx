import { ButtonLink } from '@/components/ui/ButtonLink';
import { ButtonAnchor } from '@/components/ui/ButtonAnchor';
import React from 'react';

function TechStackCard({ header, children }: { header: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-border bg-card p-5">
      <h4 className="text-lg font-semibold text-card-foreground">{header}</h4>

      <p className="text-muted-foreground">{children}</p>
    </div>
  );
}

export default function Page() {
  return (
    <main>
      <div className="mt-4 flex flex-col items-center">
        <h1 className="mt-4 text-center sm:text-5xl">What&apos;s New</h1>
        <div className="m-6 flex justify-center gap-3">
          <p className="w-1/2 text-muted-foreground">
            In this{' '}
            <a
              className="text-primary underline hover:text-primary-accent"
              target="_blank"
              href="https://github.com/ethankennerly/munia"
              data-activate-id="github-kennerly"
              rel="noreferrer">
              fork
            </a>
            , Ethan Kennerly enhanced the following features:
          </p>
          <ol className="w-1/2 list-disc rounded-lg bg-card px-6 py-2 text-muted-foreground">
            <li>
              Patched DoS vulnerability (
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://react.dev/blog/2025/12/11/denial-of-service-and-source-code-exposure-in-react-server-components"
                rel="noreferrer">
                2025-12-11
              </a>
              )
            </li>
            <li>
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://www.lexology.com/library/detail.aspx?g=a20bdb6d-dffa-4936-8507-3201876b891b"
                rel="noreferrer">
                Delete
              </a>{' '}
              an account
            </li>
            <li>
              Link Google or GitHub by email (
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://www.bitdefender.com/en-us/blog/labs/attackers-pose-as-account-owners-via-facebook-login-flaw"
                rel="noreferrer">
                Facebook
              </a>{' '}
              linking is unsafe)
            </li>
            <li>
              <a
                className="text-primary underline hover:text-primary-accent"
                target="_blank"
                href="https://github.com/leandronorcio/munia/issues/1"
                rel="noreferrer">
                Remove
              </a>{' '}
              a post
            </li>
            <li> Collapse a long post </li>
            <li> Fixed birth date editing </li>
            <li> Terms of Service </li>
            <li> Privacy Policy </li>
            <li> Admin replays clicks and scrolling </li>
          </ol>
        </div>
        <a href="https://twitter.com/norciodotdev" data-activate-id="follow-x">
          <p className="inline-block rounded-lg bg-card px-3 py-2 text-card-foreground">Follow Leandro Norcio on X</p>
        </a>
        <h1 className="mt-4 px-5 text-center text-2xl sm:text-5xl">
          A responsive and accessible full stack social media web app.
        </h1>
        <div className="mt-6 flex justify-center gap-3">
          <ButtonLink href="/login" size="medium" data-activate-id="get-started">
            Get Started
          </ButtonLink>
          <ButtonAnchor
            href="https://github.com/leandronorcio/munia"
            size="medium"
            mode="secondary"
            data-activate-id="github-norcio">
            Github
          </ButtonAnchor>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-center text-3xl sm:text-5xl">Technology Stack</h2>
        <p className="mt-2 px-4 text-center text-lg text-muted-foreground">
          This social media web app is built using the following modern technologies.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3 px-4 md:grid-cols-3">
          {[
            {
              header: 'TypeScript',
              details: 'Strongly-typed code and components for maintainability.',
            },
            {
              header: 'Next.js 14',
              details: 'App router, route handlers, nested layouts, and more.',
            },
            { header: 'React 18', details: 'Server and client components.' },
            {
              header: 'Prisma',
              details: 'Type-safe and intuitive database ORM.',
            },
            {
              header: 'NextAuth.js 5',
              details: 'Secure email and social OAuth logins.',
            },
            {
              header: 'React Query',
              details: 'Efficient data-fetching and caching.',
            },
            {
              header: 'Tailwind CSS',
              details: 'Utility classes for building components.',
            },
            { header: 'Framer Motion', details: 'Animation for components.' },
            {
              header: 'React Aria',
              details: 'Provides accessibility hooks for components.',
            },
            { header: 'Zod', details: 'Form input validation.' },
            { header: 'AWS S3', details: 'Storage for photos and videos.' },
            { header: 'AWS SES', details: 'For sending vefirication emails.' },
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
