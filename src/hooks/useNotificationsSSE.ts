import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

/**
 * Opens an EventSource connection to the SSE notifications endpoint.
 *
 * On each `count` event the hook updates the React Query cache for
 * `['users', userId, 'notifications', 'count']`, which drives the
 * unread badge in MenuBar and the "mark all as read" button state.
 *
 * When the count *increases* the hook also invalidates the notifications
 * list query so the Notifications page picks up new items.
 *
 * The browser's built-in EventSource will auto-reconnect on drop,
 * which naturally handles Vercel's serverless function timeouts.
 */
export function useNotificationsSSE() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const queryClient = useQueryClient();
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    const url = `/api/users/${userId}/notifications/stream`;
    const eventSource = new EventSource(url);

    eventSource.addEventListener('count', (e: MessageEvent) => {
      const count = JSON.parse(e.data) as number;

      // Update the cached notification count
      queryClient.setQueryData(['users', userId, 'notifications', 'count'], count);

      // If count increased, new notifications arrived — refetch the list
      if (prevCountRef.current !== null && count > prevCountRef.current) {
        queryClient.invalidateQueries({
          queryKey: ['users', userId, 'notifications'],
          exact: true,
        });
      }

      prevCountRef.current = count;
    });

    return () => {
      eventSource.close();
    };
  }, [userId, queryClient]);
}
