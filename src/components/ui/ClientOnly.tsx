'use client';

import React, { useEffect, useState } from 'react';

/**
 * ClientOnly component that only renders children after the component has mounted.
 * This prevents hydration mismatches and layout shift during slow network conditions
 * by ensuring JavaScript has fully loaded before rendering interactive components.
 *
 * Usage:
 * ```tsx
 * <ClientOnly>
 *   <ThemeSwitch />
 *   <CreatePostModalLauncher />
 * </ClientOnly>
 * ```
 */
export default function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return children as React.ReactElement;
}
