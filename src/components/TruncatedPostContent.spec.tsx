import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TruncatedPostContent } from './TruncatedPostContent';

describe('TruncatedPostContent', () => {
  it('displays short content without truncation', () => {
    const shortText = 'Short post content';
    render(<TruncatedPostContent content={shortText} />);

    expect(screen.getByText('Short post content')).toBeInTheDocument();
    expect(screen.queryByText(/components_show_more|components_show_less/i)).not.toBeInTheDocument();
  });

  it('truncates long content to 3 lines', () => {
    const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    render(<TruncatedPostContent content={longText} />);

    // Content should be displayed
    expect(screen.getByText(/Line 1/i)).toBeInTheDocument();
    // Should have expand button
    expect(screen.getByText(/components_show_more/i)).toBeInTheDocument();
  });

  it('shows expand button for content with more than 3 lines', () => {
    const longText = 'A long\nlong\nlong\nlong\nlong\npost';
    render(<TruncatedPostContent content={longText} />);

    expect(screen.getByText(/components_show_more/i)).toBeInTheDocument();
  });

  it('expands content when "components_show_more" is clicked', async () => {
    const user = userEvent.setup();
    const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    render(<TruncatedPostContent content={longText} />);

    const expandButton = screen.getByText(/components_show_more/i);
    await user.click(expandButton);

    expect(screen.getByText(/components_show_less/i)).toBeInTheDocument();
    expect(screen.queryByText(/components_show_more/i)).not.toBeInTheDocument();
  });

  it('collapses content when "components_show_less" is clicked', async () => {
    const user = userEvent.setup();
    const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    render(<TruncatedPostContent content={longText} />);

    // First expand
    const expandButton = screen.getByText(/components_show_more/i);
    await user.click(expandButton);

    // Then collapse
    const collapseButton = screen.getByText(/components_show_less/i);
    await user.click(collapseButton);

    expect(screen.getByText(/components_show_more/i)).toBeInTheDocument();
    expect(screen.queryByText(/components_show_less/i)).not.toBeInTheDocument();
  });

  it('preserves newlines in content', () => {
    const textWithNewlines = 'First line\nSecond line\nThird line';
    const { container } = render(<TruncatedPostContent content={textWithNewlines} />);

    const html = container.innerHTML;
    expect(html).toContain('<br>');
  });

  it('handles empty content', () => {
    render(<TruncatedPostContent content="" />);

    // Should not crash and should not show expand button
    expect(screen.queryByText(/components_show_more|components_show_less/i)).not.toBeInTheDocument();
  });

  it('handles content with exactly 3 lines', () => {
    const threeLines = 'Line 1\nLine 2\nLine 3';
    render(<TruncatedPostContent content={threeLines} />);

    // Should not show expand button for exactly 3 lines
    expect(screen.queryByText(/components_show_more/i)).not.toBeInTheDocument();
  });
});
