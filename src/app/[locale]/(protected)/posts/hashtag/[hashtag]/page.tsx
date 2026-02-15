import { Posts } from '@/components/Posts';

export default async function Page({ params }: { params: Promise<{ hashtag: string }> }) {
  const resolvedParams = await params;
  return (
    <main>
      <div className="px-4 pt-4">
        <h1 className="mb-4 text-2xl font-bold sm:text-3xl">#{resolvedParams.hashtag}</h1>
        <Posts type="hashtag" hashtag={resolvedParams.hashtag} />
      </div>
    </main>
  );
}
