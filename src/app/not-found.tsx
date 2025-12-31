'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="h1 text-foreground font-bold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">The page was not found. If this was a username, the user might have changed their name.</p>
      <p className="mt-2 text-muted-foreground"> {window.location.href} </p>
      
      <Link 
        href="/feed" 
        className="mt-6 px-4 py-2 text-primary-accent rounded-md transition"
      >
        Go to Feed
      </Link>
    </div>
  );
}
