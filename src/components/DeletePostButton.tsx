'use client';

import Button from '@/components/ui/Button';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Determine ownership by fetching the post
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (!res.ok) return;
        const post = await res.json();
        if (!cancelled) setOwnerId(post?.user?.id ?? null);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const isOwner = !!session?.user?.id && !!ownerId && session.user.id === ownerId;

  const confirmAndDelete = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: true, recentAuthTimestamp: Date.now() }),
      });
      if (!res.ok) throw new Error('Failed to delete post');
      // Navigate to feed after deletion
      router.push('/feed');
    } catch (_e) {
      // optional: toast/notification
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }, [postId, router]);

  const openDialog = useCallback(() => setOpen(true), []);
  const closeDialog = useCallback(() => setOpen(false), []);

  if (!isOwner) return null;

  return (
    <div className="mt-6">
      <Button
        onPress={openDialog}
        shape="pill"
        expand="full"
        mode="secondary"
        loading={loading}
        data-activate-id="delete-post">
        Delete Post
      </Button>
      <ConfirmDialog
        open={open}
        title="Delete post"
        message="This will permanently delete the post and its media. This action cannot be undone. Continue?"
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={closeDialog}
        onConfirm={confirmAndDelete}
      />
    </div>
  );
}
