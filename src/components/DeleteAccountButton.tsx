'use client';

import Button from '@/components/ui/Button';
import { useCallback, useState } from 'react';
import { signOut } from 'next-auth/react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const confirmAndDelete = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, recentAuthTimestamp: Date.now() }),
      });
      if (!res.ok) throw new Error('Deletion failed');
      await signOut({ callbackUrl: '/register' });
    } catch (_e) {
      // optional toast here
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }, []);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);

  return (
    <div className="mt-6">
      <Button onPress={openDialog} shape="pill" expand="full" mode="secondary" loading={loading} data-activate-id="delete-account">
        Delete Account
      </Button>
      <ConfirmDialog
        open={open}
        title="Delete account"
        message="This will permanently delete your account and all data. This action cannot be undone. Continue?"
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={closeDialog}
        onConfirm={confirmAndDelete}
      />
    </div>
  );
}
