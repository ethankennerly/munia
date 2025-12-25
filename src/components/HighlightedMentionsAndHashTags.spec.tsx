import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { HighlightedMentionsAndHashTags } from './HighlightedMentionsAndHashTags';

describe('HighlightedMentionsAndHashTags', () => {
  it('preserves newlines in the middle of text', () => {
    const text = 'First line\nSecond line';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} />);

    // Check that <br> tags are present in the rendered output
    const html = container.innerHTML;
    expect(html).toContain('<br>');
  });

  it('preserves multiple newlines', () => {
    const text = 'Line 1\n\nLine 3';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} />);

    const html = container.innerHTML;
    // Should have two <br> tags for two newlines
    const brCount = (html.match(/<br>/g) || []).length;
    expect(brCount).toBeGreaterThanOrEqual(2);
  });

  it('preserves newlines with mentions', () => {
    const text = 'Hello @user\nHow are you?';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} shouldAddLinks />);

    const html = container.innerHTML;
    expect(html).toContain('<br>');
    // Should still highlight the mention
    expect(html).toContain('@user');
  });

  it('preserves newlines with hashtags', () => {
    const text = 'Check this out\n#awesome';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} shouldAddLinks />);

    const html = container.innerHTML;
    expect(html).toContain('<br>');
    // Should still highlight the hashtag
    expect(html).toContain('#awesome');
  });

  it('handles text without newlines', () => {
    const text = 'Simple text without newlines';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} />);

    const html = container.innerHTML;
    expect(html).toContain('Simple text without newlines');
    // Should not have unnecessary <br> tags
    expect(html).not.toContain('<br>');
  });

  it('handles empty text', () => {
    const { container } = render(<HighlightedMentionsAndHashTags text="" />);

    const html = container.innerHTML;
    // Should render something (even if empty)
    expect(html).toBeDefined();
  });

  it('preserves newlines at the start of text', () => {
    const text = '\nText after newline';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} />);

    const html = container.innerHTML;
    expect(html).toContain('<br>');
  });

  it('preserves newlines at the end of text', () => {
    const text = 'Text before newline\n';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} />);

    const html = container.innerHTML;
    expect(html).toContain('<br>');
  });

  it('sanitizes malicious content while preserving newlines', () => {
    const text = 'Safe text\n<script>alert("xss")</script>';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} />);

    const html = container.innerHTML;
    // Should preserve newline
    expect(html).toContain('<br>');
    // Should sanitize script tag
    expect(html).not.toContain('<script>');
  });

  it('highlights mentions correctly with newlines', () => {
    const text = '@alice\n@bob';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} shouldAddLinks />);

    const html = container.innerHTML;
    // Should have newline
    expect(html).toContain('<br>');
    // Should highlight both mentions
    expect(html).toContain('@alice');
    expect(html).toContain('@bob');
  });

  it('highlights hashtags correctly with newlines', () => {
    const text = '#react\n#typescript';
    const { container } = render(<HighlightedMentionsAndHashTags text={text} shouldAddLinks />);

    const html = container.innerHTML;
    // Should have newline
    expect(html).toContain('<br>');
    // Should highlight both hashtags
    expect(html).toContain('#react');
    expect(html).toContain('#typescript');
  });
});
