import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedHeader } from './FeedHeader';

// Mock the child components
vi.mock('@/components/ui/ThemeSwitch', () => ({
  ThemeSwitch: () => <div data-testid="theme-switch">ThemeSwitch</div>,
}));

vi.mock('@/components/CreatePostModalLauncher', () => ({
  CreatePostModalLauncher: () => <div data-testid="create-post">CreatePostModalLauncher</div>,
}));

describe('FeedHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Feed title, ThemeSwitch, and CreatePostModalLauncher after mount', () => {
    render(<FeedHeader />);

    expect(screen.getByText('components_feedheader')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
    expect(screen.getByTestId('create-post')).toBeInTheDocument();
  });

  it('maintains components during re-renders', () => {
    const { rerender } = render(<FeedHeader />);

    // Initial render
    expect(screen.getByText('components_feedheader')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
    expect(screen.getByTestId('create-post')).toBeInTheDocument();

    // Re-render (simulating server component re-render)
    rerender(<FeedHeader />);

    // Components should still be present
    expect(screen.getByText('components_feedheader')).toBeInTheDocument();
    expect(screen.getByTestId('theme-switch')).toBeInTheDocument();
    expect(screen.getByTestId('create-post')).toBeInTheDocument();
  });
});
