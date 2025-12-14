# User Deletion

This specification outlines the process for deleting a user account from the system. It includes considerations for data retention, user notification, and system cleanup.

## Requirements

- The user must be signed in and recently re‑authenticated to delete their account (e.g., re‑auth within the last 5 minutes or an explicit re‑auth step in the flow).

- The profile About page must include a button to delete the account.

- The button should be located at the bottom of the About profile page.

- The style of the button should match the style of the "Logout" button.

- The user must be prompted to confirm account deletion with clear, irreversible wording.

- The deletion operation should verify authentication before proceeding.

- The account deletion process should be irreversible and permanent from the application database perspective.

- The deletion process should ensure that all associated data in the application database (including, at minimum, posts, comments, likes, follows, and profile metadata) are removed so they are no longer accessible.

- External object storage cleanup (e.g., S3 media files) is in-scope for this spec revision. Media references in the database must be removed. Physical file cleanup is also handled.

- Other users should not be able to access the picture or info of the deleted account via the application after deletion.

- The user should be redirected to an unauthenticated entry point upon successful account deletion. That is the sign‑up page. The session must be terminated before redirect.

- The user should be able to sign up again as a new user with the same authentication credentials they used to delete their account.

- If signing up again, the user should not see any profile picture, info, or posts from the deleted account.

## Non‑Goals and Guardrails

- Do not modify authentication provider configuration or backend auth logic as part of this feature. This spec focuses on account deletion behavior only.

- No admin bulk deletion tooling is included.

- No data export (e.g., GDPR) is included in this scope.

## Observability and Safety

- Emit a structured, non‑PII audit/log event when a deletion is requested and when it completes (e.g., `{ event: "UserDeleted", userId, timestamp }`).

- The deletion operation should be idempotent (safe to retry). If invoked multiple times, the outcome remains the same without errors.

## Acceptance Criteria

- A signed‑in and recently re‑authenticated user can initiate deletion from the profile page using a clearly labeled delete button below the "Logout" button with matching styling.

- The user is prompted to confirm deletion with irreversible wording. Upon confirmation, their session is terminated, their account and application‑database data (posts, comments, likes, follows, profile metadata) are removed or fully detached, and they are redirected to the unauthenticated entry point (e.g., sign‑up or login page).

- After deletion, other users cannot access the deleted user’s profile, name, bio, or posts via the application.

- The deleted user can sign up again using the same authentication credentials, and no previous profile data, media references, or posts appear.

- Logs contain structured, non‑PII events for deletion requested and completed.