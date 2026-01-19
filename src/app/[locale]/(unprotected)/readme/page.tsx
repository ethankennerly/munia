import { readMarkdownFile } from '@/lib/markdown/readMarkdownFile';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

/**
 * Example page demonstrating how to render README.md from the repository root.
 *
 * This Server Component reads the README.md file at build time and renders it
 * using the MarkdownRenderer component with GitHub Flavored Markdown support.
 *
 * Access this page at: /readme or /[locale]/readme
 */
export default function ReadmePage() {
  // Read README.md from the repository root at build time
  const readmeContent = readMarkdownFile('README.md');

  return (
    <main className="flex flex-col items-center py-8">
      <ResponsiveContainer className="px-4 md:px-0">
        <article className="prose prose-lg max-w-none rounded-2xl bg-card px-4 py-8 shadow lg:prose-xl sm:px-8">
          <MarkdownRenderer content={readmeContent} wrapWithProse={false} />
        </article>
      </ResponsiveContainer>
    </main>
  );
}
