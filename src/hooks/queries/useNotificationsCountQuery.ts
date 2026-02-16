import { getNotificationsCount } from '@/lib/client_data_fetching/getNotificationsCount';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

/**
 * Provides the cached unread notification count.
 *
 * The cache is kept up-to-date by the SSE connection in
 * {@link useNotificationsSSE} (mounted in MenuBar), so polling
 * is no longer needed here.
 */
export function useNotificationsCountQuery() {
  const { data: session } = useSession();
  const userId = session?.user.id;

  return useQuery<number>({
    queryKey: ['users', userId, 'notifications', 'count'],
    queryFn: async () => getNotificationsCount({ userId: userId! }),
    enabled: !!userId,
    // No refetchInterval — the SSE stream pushes count updates.
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
