'use client';

import React from 'react';
import { FixedBottomNavContainer } from './FixedBottomNavContainer';

interface MobileBottomNavProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper component for unprotected mobile bottom navigation.
 * Uses FixedBottomNavContainer for consistent positioning with protected MenuBar.
 * Additional className is merged for unprotected-specific styling (items-center, justify-between, etc.)
 */
export function MobileBottomNav({ children, className = '' }: MobileBottomNavProps) {
  return <FixedBottomNavContainer className={className}>{children}</FixedBottomNavContainer>;
}
