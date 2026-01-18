import type { ReactNode } from 'react';
import { Poppins } from 'next/font/google';
import { cn } from '@/lib/cn';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark overflow-y-scroll">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2, viewport-fit=cover" />
      </head>
      <body className={cn('bg-background text-foreground', poppins.className)}>{children}</body>
    </html>
  );
}
