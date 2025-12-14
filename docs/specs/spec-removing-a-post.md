# Removing a Post

- A post appears in a social feed.
- The user must be signed in and recently re‑authenticated to remove a post (recent auth ≤ 5 minutes or an explicit re‑auth step in the flow).
- Only for the poster, the post menu must include a button to delete the post.
- Show a confirmation modal with clear, irreversible wording before deletion proceeds.

## Clarifications

- Only the post owner may delete their own post. Admin/moderator deletion is out of scope for this spec.
- Deletion is a hard delete in the application database. Related records (likes, comments, replies) must be removed via cascades.
- If the post has media, delete referenced files from external storage (e.g., S3) as part of the operation; database references must also be removed.
- Do not delete image if the image in the post is linked elsewhere. For example, a post of a new profile picture. Delete the post. The profile picture should still remain for that profile.
- The user has a profile picture and a profile banner. Find those in the codebase. Do not delete them. Also do not delete an image if the image appears in two posts where only one of the two posts was deleted.
- After successful deletion, the post must disappear from any visible feed/detail (optimistic UI update allowed). On failure, show a non‑PII error toast.