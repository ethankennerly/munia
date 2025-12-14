# Authentication Tech Spec

## Goal
For release 0.2 (2025-12-14), ship a minimal, reliable authentication flow that uses Google as the single visible sign-in provider in the UI. Keep all existing authentication providers and logic intact in the backend configuration and codebase. UI-only change.

The Munia repo already implemented Google authentication and already displayed the authentication providers for sign-up, login, and logout. This spec removes the other authentication provider UI for sign-up, login, and logout. This spec does not remove the support for the other providers. Only hide the UI.

## Scope
- Use Google as the only visible sign-in option in the UI.
- Hide other providers (e.g., GitHub, Email/Password, Twitter) from the UI only.
- Keep the logic and server-side configuration of other providers in the codebase unchanged.

## Non-Goals (for this release)
- Changing Munia's implementation of authentication.
- Changing Munia's pre-existing UI.

## Implementation Outline
Assuming Next.js with next-auth (or similar):
1. Do NOT change the server-side auth configuration or remove providers. Providers (GitHub, Google, Facebook, Email, etc.) must remain registered and functional.
2. Update only the UI components to render a single "Continue with Google" button for sign-in/sign-up flows.
3. Add guardrails: code review checklist must verify no changes under `src/auth.ts`, `src/auth.config.ts`, adapters, or provider registrations.

## Acceptance Criteria
- Only the Google button is visible anywhere login is offered (login/register/logout flows).
- Other providers are not rendered in the UI.
- Server-side auth configuration remains unchanged; other providers stay registered and functional.