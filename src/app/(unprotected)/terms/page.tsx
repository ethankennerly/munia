import 'server-only';
import { getTermsText, TERMS_PLACEHOLDER } from '@/lib/terms';

export const dynamic = 'force-static';

export default async function Page() {
  const text = await getTermsText();
  const toRender = text ?? TERMS_PLACEHOLDER;

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-4 text-3xl font-bold">Terms</h1>
      <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">{toRender}</pre>
    </main>
  );
}
