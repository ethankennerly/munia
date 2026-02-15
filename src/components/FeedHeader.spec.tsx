import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedHeader, FeedHeaderSkeleton } from './FeedHeader';

// Mock the child components
vi.mock('@/components/CreatePostModalLauncher', () => ({
  CreatePostModalLauncher: () => <div data-testid="create-post">CreatePostModalLauncher</div>,
}));

describe('FeedHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Feed title and CreatePostModalLauncher immediately', () => {
    render(<FeedHeader />);

    expect(screen.getByText('components_feedheader')).toBeInTheDocument();
    expect(screen.getByTestId('create-post')).toBeInTheDocument();
  });

  it('maintains components during re-renders', () => {
    const { rerender } = render(<FeedHeader />);

    expect(screen.getByText('components_feedheader')).toBeInTheDocument();
    expect(screen.getByTestId('create-post')).toBeInTheDocument();

    rerender(<FeedHeader />);

    expect(screen.getByText('components_feedheader')).toBeInTheDocument();
    expect(screen.getByTestId('create-post')).toBeInTheDocument();
  });
});

describe('FeedHeaderSkeleton', () => {
  it('renders shimmer placeholders that reserve space', () => {
    const { container } = render(<FeedHeaderSkeleton />);

    const shimmers = container.querySelectorAll('.animate-shimmer');
    expect(shimmers.length).toBeGreaterThanOrEqual(3);
  });
});
