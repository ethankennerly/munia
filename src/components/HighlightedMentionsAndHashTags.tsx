import React from 'react';
import parse, { Element, domToReact, DOMNode } from 'html-react-parser';
import DOMPurify from 'dompurify';
import Link from 'next/link';

export function HighlightedMentionsAndHashTags({ text, shouldAddLinks }: { text: string; shouldAddLinks?: boolean }) {
  /**
   * Define a regex pattern to match words that begin with `@` or `#`
   *
   * * The first group matches either the start of a line (^) or a whitespace character (\s)
   * * The second group matches either the `@` or `#`
   * * The third group matches the word after the `@` or `#`
   */
  const pattern = /(^|\s)(@|#)(\w+|\w+)/g;
  // Convert newlines to <br> tags to preserve line breaks
  const textWithBreaks = text.replace(/\n/g, '<br>');
  // Sanitize with DOMPurify - it will preserve <br> tags and escape any malicious content
  const cleanText = DOMPurify.sanitize(textWithBreaks);

  // Use replace() method to surround the matches' word with the <span> tag
  const html = cleanText.replace(pattern, (match, space: string, char: string, word: string) => {
    const coloredWord = `<span class="text-blue-600 dark:text-blue-400">${char}${word}</span>`;

    if (!shouldAddLinks) return `${space}${coloredWord}`;

    const isHashtag = char === '#';
    const url = isHashtag ? `/posts/hashtag/${word}` : `/${word}`;
    return `${space}<a href="${url}">${coloredWord}</a>`;
  });

  if (!shouldAddLinks) return parse(html) as React.ReactElement;
  return parse(html, {
    replace: (domNode) => {
      // Convert the <a> tags into NextJS <Link>'s
      if (domNode instanceof Element && domNode.attribs && domNode.attribs.href && domNode.children)
        return (
          <Link href={domNode.attribs.href} className="link">
            {domToReact(domNode.children as DOMNode[])}
          </Link>
        );
      return domNode;
    },
  }) as React.ReactElement;
}
