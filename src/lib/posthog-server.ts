import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

/**
 * Get the server-side PostHog client, or null if the key is not configured.
 * Note: Server-side functions in Next.js can be short-lived,
 * so we set flushAt to 1 and flushInterval to 0 to ensure events are sent immediately.
 */
export function getPostHogClient(): PostHog | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (!posthogClient) {
    posthogClient = new PostHog(key, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return posthogClient;
}

export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}
