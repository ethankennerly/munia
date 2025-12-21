'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

interface ReplayContextType {
  isReplaying: boolean;
  setIsReplaying: (value: boolean) => void;
}

const ReplayContext = createContext<ReplayContextType | undefined>(undefined);

export function ReplayProvider({ children }: { children: ReactNode }) {
  const [isReplaying, setIsReplaying] = useState(false);

  const value = useMemo(() => ({ isReplaying, setIsReplaying }), [isReplaying]);

  return <ReplayContext.Provider value={value}>{children}</ReplayContext.Provider>;
}

export function useReplayContext() {
  const context = useContext(ReplayContext);
  if (context === undefined) {
    throw new Error('useReplayContext must be used within ReplayProvider');
  }
  return context;
}
