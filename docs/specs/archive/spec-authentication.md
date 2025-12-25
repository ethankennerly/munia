# Configurable Authentication Provider Tech Spec

## Goal
- Environment variables that configure the authentication provider also configures server-side rendering of the button to sign-in with that provider.
- Keep all existing authentication providers and logic intact in the backend configuration and codebase. UI-only change.
- The Munia repo already implemented Google authentication and already displayed the authentication providers for sign-up, login, and logout.
- This spec removes the other authentication provider UI for sign-up, login, and logout if the environment variable of the authentication provider is missing.

## Non-Goals
- Changing Munia's implementation of authentication.
- Changing Munia's pre-existing UI.

## Implementation Outline
Assuming Next.js with next-auth (or similar):
1. Do NOT change the server-side auth configuration or remove providers. Providers (GitHub, Google, Facebook, Email, etc.) must remain registered and functional.
2. Update only the UI components to render a single "Continue with Google" button for sign-in/sign-up flows. Since the server configures the provider, update via server-side rendering.
3. Add guardrails: code review checklist must verify no changes under `src/auth.ts`, `src/auth.config.ts`, adapters, or provider registrations.