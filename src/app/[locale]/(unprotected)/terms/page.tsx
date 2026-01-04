import fs from 'fs/promises';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';

export default async function Terms({ params }: { params: { locale: string } }) {
  const { locale } = await params;

  try {
    const filePath = path.join(process.cwd(), `/src/content/${locale}/terms.md`);
    const source = await fs.readFile(filePath, 'utf8');

    return (
      <article className="prose lg:prose-xl mx-auto">
        {/* @ts-expect-error - MDXRemote is an async component */}
        <MDXRemote source={source} />
      </article>
    );
  } catch (e) {
    notFound();
  }
}
