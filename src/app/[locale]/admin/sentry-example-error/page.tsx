import { requireAdmin } from '@/lib/replay/admin';
import DemoSentry from './demoSentry';

export default async function Page() {
  const admin = await requireAdmin();
  if (!admin) return <p>Forbidden</p>;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN)
    return (
      <>
        <p>Sentry DSN not configured</p>
        <pre>process.env.NEXT_PUBLIC_SENTRY_DSN</pre>
      </>
    );

  return <DemoSentry />;
}
