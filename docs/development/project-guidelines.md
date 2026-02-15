# Copilot / AI Agent Instructions for Munia

You are an efficient software engineer. Be concise and practical: answer briefly, write minimal working code or single-file diffs, with no comments or explanations. If ambiguous, ask one brief clarifying question.

## Quick start & common commands ✅
- Start dev server: `npm install` (runs `postinstall` → Prisma generate) then `npm run dev` (Next.js on port 3002).
- Tests: `npm run test`
- Build & production: `npm run build` then `npm run start -p 3002`.
- DB: `npm run prisma:deploy`, seed: `npm run prisma:seed`.
- Utility scripts: see `scripts/`

## High-level architecture (big picture) 🏗️
- Next.js app using **React Server Components** broadly; interactive flows use `'use client'` components.
- Most data fetching/mutations are client-side and handled with **React Query** for caching/optimistic updates.
- Database: **Prisma** models live in `prisma/schema.prisma` (single source of truth for DB schema).

## Project-specific conventions & patterns 🧭
- Date handling: **Always use date-only helpers** in `src/lib/utils/dateOnly.ts` (`extractDateOnly`, `parseDateOnly`) for birthdates and other date-only values (prevents timezone bugs).
- Environment variables: prefer direct access to `process.env.NEXT_PUBLIC_*` (Next replaces at build time) — see `src/lib/replay/config.ts` for examples.
- Logging: structured JSON logs via `src/lib/logging.ts` (levels: error/warn/info/debug). Tests rely on debug mode detection (`NODE_ENV === 'test'` or `VITEST_WORKER_ID`).

## Integration points & environment notes 🔗
- External services: AWS S3 (media), AWS SES (email), OAuth providers (Github/Google/Facebook). Configure client IDs/secrets in `.env` / `.env.local`.
- Deploy notes: follow Deployment steps in README; set `git config core.hooksPath git_hooks` to enable the repo's pre-push checks.

## Tests
- Only write tests for .ts files or .js files. Do not write tests for .tsx or .jsx files. The mocking of components is more complex.
- TDD workflow with .ts or .js files: tests colocated with code (`*.spec.ts`, `*.spec.tsx`) and **write failing test first** — see `docs/development/tdd-ci-standards.md` for exact rules.
- Test performance constraints: feature tests < 1s; full suite < 10s. Avoid network I/O in tests; use MSW or mocks.

## Pre-push hooks
- Always pass `git_hooks/pre-push` before claiming an edit was a success.
- Pre-push hook enforces lint/test/build/validate (see `git_hooks/pre-push`). **Must run locally**: always run `git_hooks/pre-push` and ensure it completes successfully before creating a PR or pushing a branch. If the hook fails, fix tests/lint/build issues or add tests as needed — do not push commits that fail the pre-push hook.
- Use `git push --dry-run` for dry-run validation.

## Examples & quick file references 📁
- Date helpers: `src/lib/utils/dateOnly.ts` (+ tests `*.spec.ts`)
- Logging: `src/lib/logging.ts`, `src/lib/logging-client.ts`
- Auth: `src/auth.ts`, `src/auth.config.ts`
- Prisma schema: `prisma/schema.prisma`
- Scripts: `scripts/*.mjs` (replay, createMockUsers, validate-build)