# PostHog post-wizard report

The wizard has completed a deep integration of your Munia social media Next.js project with PostHog analytics. This integration includes both client-side and server-side event tracking, user identification, a reverse proxy to avoid ad blockers, and exception capturing.

## Integration summary

### Client-side setup
- Added PostHog initialization in `src/instrumentation-client.ts` alongside existing Sentry setup
- Configured reverse proxy via Next.js rewrites in `next.config.mjs` to avoid ad blockers
- Added user identification in `src/components/Providers.tsx` that syncs with NextAuth sessions

### Server-side setup
- Created `src/lib/posthog-server.ts` for server-side PostHog client
- Added server-side event tracking for authentication and account operations

### Environment variables
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog project API key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog API host URL

## Events implemented

| Event Name | Description | File Path |
|------------|-------------|-----------|
| `user_signed_up` | New user account created (server-side) | `src/lib/auth/handleCreateUser.ts` |
| `user_signed_in` | User signs in (server-side) | `src/lib/auth/handleSignIn.ts` |
| `post_created` | User creates a new post with optional media | `src/hooks/mutations/useWritePostMutations.ts` |
| `post_edited` | User edits an existing post | `src/hooks/mutations/useWritePostMutations.ts` |
| `post_liked` | User likes a post | `src/hooks/mutations/usePostLikesMutations.ts` |
| `post_unliked` | User unlikes a post | `src/hooks/mutations/usePostLikesMutations.ts` |
| `comment_submitted` | User submits a comment on a post | `src/hooks/mutations/useCreateCommentMutations.ts` |
| `user_followed` | User follows another user | `src/hooks/mutations/useFollowsMutations.ts` |
| `user_unfollowed` | User unfollows another user | `src/hooks/mutations/useFollowsMutations.ts` |
| `profile_updated` | User updates their profile information | `src/hooks/mutations/useSessionUserDataMutation.ts` |
| `account_deletion_requested` | User initiates account deletion flow | `src/components/DeleteAccountButton.tsx` |
| `account_deleted` | User account successfully deleted (server-side) | `src/app/api/account/DELETE.ts` |
| `user_search_performed` | User performs a search for other users | `src/components/DiscoverSearch.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

### Dashboard
- [Analytics basics](https://us.posthog.com/project/193398/dashboard/1283339) - Core analytics dashboard with user engagement, conversion funnels, and business-critical insights

### Insights
- [User Authentication Trends](https://us.posthog.com/project/193398/insights/5HlqMpLN) - Daily sign-ups and sign-ins over the last 30 days
- [New User Activation Funnel](https://us.posthog.com/project/193398/insights/UBkSU7pN) - Conversion from sign-up to first post within 7 days
- [Content Engagement Metrics](https://us.posthog.com/project/193398/insights/drQmP74g) - Daily posts, comments, and likes over the last 30 days
- [Social Graph Activity](https://us.posthog.com/project/193398/insights/3xDZ5PuO) - Daily follows and unfollows - track community growth
- [Churn Monitoring](https://us.posthog.com/project/193398/insights/RWRFmGYg) - Track account deletion requests and completed deletions to monitor user churn

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/posthog-integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
