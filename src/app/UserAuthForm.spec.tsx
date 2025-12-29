import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { UserAuthForm } from './(auth)/UserAuthForm';

// Mock toast hook to capture calls
const showToastMock = vi.fn();
vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showToast: showToastMock }),
}));

// Prepare a stable mock for useSearchParams
type MockSearchParams = { get: (k: string) => string | null };
let currentParams: URLSearchParams;
let stableSearchParamsObj: MockSearchParams;

vi.mock('next/navigation', () => ({
  useSearchParams: () => stableSearchParamsObj,
}));

describe('UserAuthForm OAuth error handling', () => {
  const originalLocation = window.location;
  const replaceStateSpy = vi.spyOn(window.history, 'replaceState');

  beforeEach(() => {
    // Reset mocks and create stable object that proxies to currentParams
    showToastMock.mockReset();
    replaceStateSpy.mockReset();
    currentParams = new URLSearchParams();
    stableSearchParamsObj = {
      get: (k: string) => currentParams.get(k),
    };

    // JSDOM readonly location workaround: redefine to allow setting pathname/hash
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, pathname: '/login', hash: '' },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('shows toast when error=OAuthAccountNotLinked and cleans URL (preserves hash)', () => {
    // Arrange URL with error and hash
    currentParams.set('error', 'OAuthAccountNotLinked');
    window.location.hash = '#_=_';

    render(<UserAuthForm />);

    // Assert toast called with expected content
    expect(showToastMock).toHaveBeenCalledTimes(1);
    expect(showToastMock).toHaveBeenCalledWith({
      type: 'error',
      title: 'Sign in error',
      message: 'That Facebook email already signed in. Try GitHub or Google.',
    });

    // Assert URL cleaned using history.replaceState: pathname + hash only
    expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/login#_=_');
  });

  it('does not show toast when error param is absent', () => {
    render(<UserAuthForm />);
    expect(showToastMock).not.toHaveBeenCalled();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  it('shows the toast only once even if component re-renders', () => {
    currentParams.set('error', 'OAuthAccountNotLinked');

    const { rerender } = render(<UserAuthForm />);
    expect(showToastMock).toHaveBeenCalledTimes(1);

    // Trigger a re-render with the same props; effect should not re-fire
    rerender(<UserAuthForm />);
    expect(showToastMock).toHaveBeenCalledTimes(1);
  });
});
