'use client';

import Button from '@/components/ui/Button';
import { useCallback, useState } from 'react';
import { signOut } from 'next-auth/react';

export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(async () => {
    const confirmed = typeof window !== 'undefined' && window.confirm('This will permanently delete your account and all data. This action cannot be undone. Continue?');
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, recentAuthTimestamp: Date.now() }),
      });
      if (!res.ok) throw new Error('Deletion failed');
      await signOut({ callbackUrl: '/register' });
    } catch (e) {
      // You may want to show a toast; keeping minimal per spec
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="mt-6">
      <Button onPress={handleDelete} shape="pill" expand="full" mode="secondary" loading={loading}>
        Delete Account
      </Button>
    </div>
  );
}
