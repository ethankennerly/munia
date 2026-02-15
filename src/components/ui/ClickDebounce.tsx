'use client';
import { useCallback, useEffect, useRef } from 'react';

export function ClickDebounce({ milliseconds = 300, children }: { milliseconds?: number; children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const disablePointerEvents = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    wrapper.style.pointerEvents = 'none';
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      wrapper.style.pointerEvents = '';
    }, milliseconds);
  }, [milliseconds]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const handleClick = () => {
      disablePointerEvents();
    };
    wrapper.addEventListener('click', handleClick, true);
    return () => {
      wrapper.removeEventListener('click', handleClick, true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [disablePointerEvents]);

  return <div ref={wrapperRef}>{children}</div>;
}
