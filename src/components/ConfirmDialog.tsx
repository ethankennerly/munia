'use client';

import React from 'react';
import { useTranslations } from 'next-intl';

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations();
  if (!open) return null;
  const resolvedTitle = title ?? t('components_confirmdialog');
  const resolvedConfirmText = confirmText ?? t('components_confirmdialog');
  const resolvedCancelText = cancelText ?? t('components_confirmdialog_cancel');
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100vh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-md overflow-y-auto rounded-2xl bg-background p-4 shadow-xl">
        <h2 id="confirm-title" className="mb-2 text-lg font-semibold">
          {resolvedTitle}
        </h2>
        <p className="mb-4 text-sm text-foreground/80">{message}</p>
        <div className="flex w-full items-center justify-center gap-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/80">
            {resolvedCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground hover:opacity-90">
            {resolvedConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
