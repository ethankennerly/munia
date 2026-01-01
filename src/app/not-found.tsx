'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h2 className="h1 font-bold text-foreground">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page was not found. If this was a username, the user might have changed their name.
      </p>
      {typeof window === 'undefined' ? (
        <p> (No browser window) </p>
      ) : (
        <p className="mt-2 text-muted-foreground"> {window?.location?.href} </p>
      )}
      <Link href="/feed" className="mt-6 rounded-md px-4 py-2 text-primary-accent transition">
        Go to Feed
      </Link>
    </div>
  );
}
