import fs from 'fs/promises';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

export default async function PrivacyPolicy({ params }: { params: { locale: string } }) {
  const { locale } = await params;

  try {
    const filePath = path.join(process.cwd(), `/src/content/${locale}/privacy-policy.md`);
    const source = await fs.readFile(filePath, 'utf8');

    return (
      <main className="flex flex-col items-center py-8">
        <ResponsiveContainer className="px-4 md:px-0">
          <article className="prose prose-lg max-w-none rounded-2xl bg-card px-4 py-8 shadow lg:prose-xl sm:px-8">
            <MDXRemote source={source} />
          </article>
        </ResponsiveContainer>
      </main>
    );
  } catch {
    notFound();
  }
}
