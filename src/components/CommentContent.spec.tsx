import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CommentContent } from './CommentContent';

describe('CommentContent', () => {
  it('wraps long unbroken words to prevent overflow', () => {
    const longWord = 'a'.repeat(200);
    const { container } = render(
      <CommentContent name="Test" username="test" content={longWord} createdAt={new Date()} />,
    );
    const textElement = container.querySelector('p.mb-1');
    expect(textElement).toHaveClass('break-words');
  });

  it('wraps long URLs to prevent overflow', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(200);
    const { container } = render(
      <CommentContent name="Test" username="test" content={longUrl} createdAt={new Date()} />,
    );
    const textElement = container.querySelector('p.mb-1');
    const containerDiv = container.querySelector('.w-full');
    expect(textElement).toHaveClass('break-words');
    expect(containerDiv).toBeInTheDocument();
  });
});
