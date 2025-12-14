import 'server-only';
import { PRIVACY_POLICY_PLACEHOLDER, getPrivacyPolicyText } from '@/lib/privacyPolicy';

export const dynamic = 'force-static';

export default async function Page() {
  const text = await getPrivacyPolicyText();
  const toRender = text ?? PRIVACY_POLICY_PLACEHOLDER;

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
      <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">{toRender}</pre>
    </main>
  );
}
