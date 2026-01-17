import { requireAdmin } from '@/lib/replay/admin';
import DemoSentry from './demoSentry';

export default async function Page() {
  const admin = await requireAdmin();
  if (!admin) return <p>Forbidden</p>;

  return <DemoSentry />;
}
