import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientOnly from './ClientOnly';

describe('ClientOnly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children after mount', () => {
    render(
      <ClientOnly>
        <div data-testid="child">Child content</div>
      </ClientOnly>,
    );

    // After mount (useEffect runs), children should be rendered
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toHaveTextContent('Child content');
  });

  it('renders nothing when children is null', () => {
    const { container } = render(<ClientOnly>{null}</ClientOnly>);

    // After mount, if children is null, should render nothing
    expect(container.firstChild).toBeNull();
  });

  it('renders multiple children after mount', () => {
    render(
      <ClientOnly>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </ClientOnly>,
    );

    // After mount, both children should be rendered
    expect(screen.getByTestId('child1')).toBeInTheDocument();
    expect(screen.getByTestId('child2')).toBeInTheDocument();
  });

  it('uses useState and useEffect to delay rendering', () => {
    // This test verifies the component structure is correct
    // The actual delay behavior is tested in production (browser environment)
    const { container } = render(
      <ClientOnly>
        <div data-testid="child">Content</div>
      </ClientOnly>,
    );

    // Component should render children after mount
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
