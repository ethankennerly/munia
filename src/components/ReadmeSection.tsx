import { readMarkdownFile } from '@/lib/markdown/readMarkdownFile';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

/**
 * Server Component that renders the README.md content.
 *
 * This component reads the README.md file at build time and renders it
 * with the same styling as the Terms and Privacy pages.
 */
export async function ReadmeSection() {
  // Read README.md from the repository root at build time
  const readmeContent = readMarkdownFile('README.md');

  return (
    <div className="flex flex-col items-center py-8">
      <ResponsiveContainer>
        <article className="prose prose-lg max-w-none rounded-2xl bg-card px-4 py-8 shadow lg:prose-xl sm:px-8">
          <MarkdownRenderer content={readmeContent} wrapWithProse={false} />
        </article>
      </ResponsiveContainer>
    </div>
  );
}
