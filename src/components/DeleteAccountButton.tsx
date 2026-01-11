'use client';

import Button from '@/components/ui/Button';
import { useCallback, useState } from 'react';
import { signOut } from 'next-auth/react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useTranslations } from 'next-intl';

export function DeleteAccountButton() {
  const t = useTranslations();
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
      if (!res.ok) throw new Error(t('api_account_delete_deletion_failed'));
      await signOut({ callbackUrl: '/register' });
    } catch {
      // optional toast here
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }, [t]);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);

  return (
    <div className="mt-6">
      <Button
        onPress={openDialog}
        shape="pill"
        expand="full"
        mode="secondary"
        loading={loading}
        data-activate-id="delete-account">
        {t('delete_account')}
      </Button>
      <ConfirmDialog
        open={open}
        title={t('components_delete_account')}
        message={t('components_this_will_permanently')}
        confirmText={t('components_delete')}
        cancelText={t('components_confirmdialog_cancel')}
        onCancel={closeDialog}
        onConfirm={confirmAndDelete}
      />
    </div>
  );
}
