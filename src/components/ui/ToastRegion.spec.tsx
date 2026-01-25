import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastRegion } from './ToastRegion';

const MODAL_Z_INDEX = 9999;

const mockToastState = {
  visibleToasts: [{ key: '1', content: { title: 'Error', message: 'Too large' }, priority: 0, timer: null }],
  add: vi.fn(),
  remove: vi.fn(),
} as unknown as ReturnType<typeof import('@react-stately/toast').useToastState<import('@/lib/toast').ToastType>>;

describe('ToastRegion', () => {
  it('stacks above Create Post dialog so error toast appears in front', () => {
    const { container } = render(<ToastRegion state={mockToastState} />);
    const regionEl = container.firstChild as HTMLElement;
    expect(regionEl).toBeInTheDocument();
    const zClass = Array.from(regionEl.classList).find((c) => c.startsWith('z-'));
    const z = zClass === 'z-[10000]' ? 10000 : zClass ? Number.parseInt(zClass.replace('z-', ''), 10) : 0;
    expect(z).toBeGreaterThan(MODAL_Z_INDEX);
  });
});
