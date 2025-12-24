# Privacy Policy

This document specifies the loading and formatting of the privacy policy for our application.

## Requirements

- A file is stored at `public/privacy-policy.txt` (UTF-8 encoded). This file is the single source of truth for the policy text.
- The pre-existing site root page is used as the landing page and must include a visible link to `/privacy-policy`.
- The privacy policy page route is `/privacy-policy` and is publicly accessible (no authentication required). Do not change middleware/auth configuration.
- The text in `privacy-policy.txt` is displayed on the privacy policy page, preserving line breaks. Treat content as plain text (do not interpret as HTML/Markdown).
- The policy text is loaded at build/server-render time only (no live reload or polling). Updates require a new deployment.

## Clarifications

- Do not introduce a CMS, database, or network fetch for the policy. Read the file from the local filesystem (e.g., `public/privacy-policy.txt`).
- Do not change or replace the existing landing page content; there is already a link to the privacy policy.
- Keep the page unprotected: it must remain accessible when signed out. This aligns with the unprotected paths list in auth config.
- If the file is missing at build/runtime, render a friendly placeholder message (e.g., "Privacy policy not available") and log a warning; do not crash the app.

## Acceptance Criteria

- Visiting `/privacy-policy` shows the exact text from `public/privacy-policy.txt` with line breaks preserved.
- The root (landing) page contains a working link to `/privacy-policy`.
- The page can be accessed while signed out (no redirects to login/register).
- No client-side polling or runtime reloading of the policy text occurs.