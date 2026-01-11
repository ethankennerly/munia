import fs from 'fs/promises';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';

export default async function PrivacyPolicy({ params }: { params: { locale: string } }) {
  const { locale } = await params;

  try {
    const filePath = path.join(process.cwd(), `/src/content/${locale}/privacy-policy.md`);
    const source = await fs.readFile(filePath, 'utf8');

    return (
      <article className="prose lg:prose-xl mx-auto">
        <MDXRemote source={source} />
      </article>
    );
  } catch {
    notFound();
  }
}
