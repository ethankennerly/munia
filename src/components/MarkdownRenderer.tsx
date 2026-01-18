import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/cn';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /**
   * If true, wraps content in a prose container. Set to false when parent already has prose classes.
   * @default true
   */
  wrapWithProse?: boolean;
}

/**
 * Renders markdown content with GitHub Flavored Markdown support.
 *
 * This component uses react-markdown to render markdown content with:
 * - GitHub Flavored Markdown syntax (tables, strikethrough, task lists, etc.)
 * - HTML support via rehype-raw
 * - Tailwind Typography classes for styling
 *
 * @param content - The markdown content to render
 * @param className - Optional additional CSS classes
 *
 * @example
 * ```tsx
 * // In a Server Component
 * const readmeContent = readMarkdownFile('README.md');
 * return <MarkdownRenderer content={readmeContent} />;
 * ```
 */
export function MarkdownRenderer({ content, className, wrapWithProse = true }: MarkdownRendererProps) {
  const contentElement = (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // Customize link rendering for internal Next.js links
        a: ({ href, children, ...props }) => {
          // Convert GitHub markdown links to Next.js Link components
          // For external links, use regular <a> tags
          if (href?.startsWith('/') || href?.startsWith('./')) {
            return (
              <a href={href} className="link" {...props}>
                {children}
              </a>
            );
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="link" {...props}>
              {children}
            </a>
          );
        },
      }}>
      {content}
    </ReactMarkdown>
  );

  if (!wrapWithProse) {
    return <div className={className}>{contentElement}</div>;
  }

  return <div className={cn('prose prose-slate max-w-none dark:prose-invert', className)}>{contentElement}</div>;
}
