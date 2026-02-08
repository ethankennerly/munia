import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { CommentContent } from './CommentContent';

describe('CommentContent', () => {
  it('wraps long unbroken words to prevent overflow', () => {
    const longWord = 'a'.repeat(200);
    const { container } = render(
      <CommentContent name="Test" username="test" content={longWord} createdAt={new Date()} />,
    );
    const textElement = container.querySelector('div.break-words');
    expect(textElement).toHaveClass('break-words');
  });

  it('wraps long URLs to prevent overflow', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(200);
    const { container } = render(
      <CommentContent name="Test" username="test" content={longUrl} createdAt={new Date()} />,
    );
    const textElement = container.querySelector('div.break-words');
    const containerDiv = container.querySelector('.w-full');
    expect(textElement).toHaveClass('break-words');
    expect(containerDiv).toBeInTheDocument();
  });

  it('displays short content without truncation', () => {
    const shortText = 'Short comment content';
    render(<CommentContent name="Test" username="test" content={shortText} createdAt={new Date()} />);

    expect(screen.getByText('Short comment content')).toBeInTheDocument();
    expect(screen.queryByText(/components_show_more|components_show_less/i)).not.toBeInTheDocument();
  });

  it('truncates content with more than 3 lines', () => {
    const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    render(<CommentContent name="Test" username="test" content={longText} createdAt={new Date()} />);

    expect(screen.getByText(/components_show_more/i)).toBeInTheDocument();
  });

  it('expands content when Show more is clicked', async () => {
    const user = userEvent.setup();
    const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    render(<CommentContent name="Test" username="test" content={longText} createdAt={new Date()} />);

    const expandButton = screen.getByText(/components_show_more/i);
    await user.click(expandButton);

    expect(screen.getByText(/components_show_less/i)).toBeInTheDocument();
    expect(screen.queryByText(/components_show_more/i)).not.toBeInTheDocument();
  });

  it('collapses content when Show less is clicked', async () => {
    const user = userEvent.setup();
    const longText = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    render(<CommentContent name="Test" username="test" content={longText} createdAt={new Date()} />);

    const expandButton = screen.getByText(/components_show_more/i);
    await user.click(expandButton);

    const collapseButton = screen.getByText(/components_show_less/i);
    await user.click(collapseButton);

    expect(screen.getByText(/components_show_more/i)).toBeInTheDocument();
    expect(screen.queryByText(/components_show_less/i)).not.toBeInTheDocument();
  });

  it('does not show expand button for exactly 3 lines', () => {
    const threeLines = 'Line 1\nLine 2\nLine 3';
    render(<CommentContent name="Test" username="test" content={threeLines} createdAt={new Date()} />);

    expect(screen.queryByText(/components_show_more/i)).not.toBeInTheDocument();
  });
});
