import { readMarkdownFile } from '@/lib/markdown/readMarkdownFile';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

export default function Page() {
  const readmeContent = readMarkdownFile('README.md');

  return (
    <main className="flex flex-col items-center py-8">
      <ResponsiveContainer>
        <article className="prose prose-lg max-w-none rounded-2xl bg-card px-4 py-8 shadow lg:prose-xl sm:px-8">
          <MarkdownRenderer content={readmeContent} wrapWithProse={false} />
        </article>
      </ResponsiveContainer>
    </main>
  );
}
